<script>
  import RangeInput from '../molecules/RangeInput';
  import Select from '../molecules/Select';
  import ModeSelector from '../organisms/ModeSelector';
  import Button from '../atoms/Button';
  import SaveButton from '../organisms/SaveButton';
  import RadioGroup from '../molecules/RadioGroup';
  import { ipcRenderer } from 'electron';
  import { COMMANDS, PELTIER_CONSTRAINTS, MODES } from '../constants';
  import { data, getStoreValue } from '../stores';
  import Chart from 'chart.js';
  import Zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount, onDestroy } from 'svelte';
  export let goBack;

  onMount(createChart);
  onDestroy(() => chart && chart.destroy());

  function createChart() {
    chart = new Chart(
      document.getElementById('effects-chart').getContext('2d'),
      configureChart(points, { x: xCaption, y: yCaption })
    );
    chart.options.onClick = chart.resetZoom();
  }

  const initialData = $data;

  let logCreated,
    startDisabled = true,
    selectedXAxis = 0,
    chart,
    points = [],
    rows = [],
    setPower = 0,
    unsubscribeData,
    elapsedTime,
    isDrawing;

  ipcRenderer
    .on('usbConnect', () => (saveDisabled = false))
    .on('usbDisconnect', () => (saveDisabled = true));

  const effectsOptions = [
    { label: 'Эффект Зеебека', value: 0 },
    { label: 'Эффект Пельтье', value: 1 },
  ];

  const plates = [
    { name: 'Cool', label: 'охлаждающей' },
    { name: 'Hot', label: 'нагревающей' },
  ];

  const xAxisPeltierOptions = {
    name: 'xAxis',
    elements: [
      {
        value: 0,
        label: 'Время',
        caption: 't, c',
        name: 'time',
      },
      {
        value: 1,
        label: 'Ток',
        caption: 'I, A',
        name: 'currentProbe',
      },
    ],
  };

  const deltaTCaption = '\u0394T, \u02daC';
  const voltageCaption = 'U, B';
  const currentCaption = 'I, A';
  const timeCaption = 't, c';

  $: yCaption = selectedEffect.value ? deltaTCaption : voltageCaption;
  $: xCaption = selectedEffect.value ? timeCaption : deltaTCaption;

  $: updateAxis('x', xCaption);
  $: updateAxis('y', yCaption);

  function updateAxis(axis, caption) {
    if (!chart) return;
    chart.options.scales[axis + 'Axes'][0].scaleLabel.labelString = caption;
    chart.update();
  }

  let selectedEffect = effectsOptions[$data.modeProbe.value];

  function selectEffect(e) {
    selectedEffect = effectsOptions[e];
    setPower = 0;
  }

  function startPeltierResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.consumeElectricityProbePeltier);
    ipcRenderer.send('serialCommand', COMMANDS.turnOnProbePeltier);
  }

  function startSeebeckResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.consumeHeatProbePeltier);
    ipcRenderer.send('serialCommand', COMMANDS.turnOnHotPeltier);
    ipcRenderer.send('serialCommand', COMMANDS.turnOnCoolPeltier);
  }

  function stopResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.turnOffAllPeltier);
  }

  function changePower(P) {
    setPower = P;
    if (selectedEffect.value) {
      ipcRenderer.send('serialCommand', ...COMMANDS.setPowerProbePeltier(P));
    }
  }

  function changeCurrent(I) {
    ipcRenderer.send('serialCommand', ...COMMANDS.setCurrentProbePeltier(I));
  }

  function toggleDrawing() {
    if (isDrawing) stopDrawing();
    else startDrawing();
  }

  function stopDrawing() {
    stopResearch();
    unsubscribeData();
    points.length = 0;
    isDrawing = false;
  }

  function startDrawing() {
    isDrawing = true;
    elapsedTime = 0;
    startLog();
    if (!selectedEffect.value) startSeebeckResearch();
    else startPeltierResearch();
    unsubscribeData = data.subscribe(addPoint);
  }

  function startLog() {
    ipcRenderer.send(
      'createFile',
      `TE-${selectedEffect.label.replace(' ', '-')}`,
      [
        timeCaption,
        selectedEffect.value ? currentCaption : voltageCaption,
        deltaTCaption,
      ]
    );
    logCreated = true;
  }

  function addPoint(data) {
    const deltaTemp = data.deltaTemp.value;
    const row = [
      ++elapsedTime,
      selectedEffect.value ? data.currentProbe.value : data.voltageProbe.value,
      deltaTemp,
    ];
    rows.push(row);
    const point = {
      y: selectedEffect.value ? deltaTemp : data.voltageProbe.value,
      x: !selectedEffect.value ? deltaTemp : row[selectedXAxis],
    };
    writeExcel(row);
    updateChart(point);
  }

  function writeExcel(row) {
    ipcRenderer.send('excelRow', row);
  }

  function updateChart(point) {
    points.push(point);
    chart.update();
  }

  function changeXAxis(e) {
    if (e.target.value != selectedXAxis) {
      selectedXAxis = +e.target.value;
      points = rows.map(row => ({
        x: row[selectedXAxis],
        y: row[row.length - 1],
      }));
      chart.data.datasets[0].data = points;
      updateAxis('x', xAxisPeltierOptions.elements[selectedXAxis].caption);
    }
  }
</script>

<div class="layout">
  <header>Исследование эффектов Пельтье и Зеебека</header>
  <main>
    <div class="controls">
      <Select
        onChange={selectEffect}
        disabled={isDrawing}
        options={effectsOptions}
        defaultValue={selectedEffect.value} />
      {#each plates as { name, label }}
        <div class="param-temp">
          <span class="temp-label">Температура {label} пластины:</span>
          <strong class="temp-value {name}">
            {$data['temperature' + name].value.toFixed(1)}{$data['temperature' + name].units}
          </strong>
        </div>
      {/each}
      {#if !selectedEffect.value}
        {#each plates as { name, label }, i}
          <div class="mode">
            <div class="mode-label">Режим работы {label} пластины:</div>
            <div class="mode-controls">
              <ModeSelector order={i} {name} />
            </div>
          </div>
        {/each}
        <div class="range">
          <span class="range-label">
            Установка тока, {$data.currentProbe.units}
          </span>
          <RangeInput
            step={0.01}
            skippedValues={[0.01, 0.02]}
            onChange={changeCurrent}
            range={PELTIER_CONSTRAINTS.CurrentProbe} />
        </div>
      {:else}
        <div class="range">
          <span class="range-label">
            Мощность модуля
            <br />
            Пельтье, % от макс
          </span>
          <RangeInput
            onChange={changePower}
            defaultValue={setPower}
            range={PELTIER_CONSTRAINTS.PowerHot} />
        </div>
        <div class="range">
          <span class="range-label">Ось x:</span>
          <RadioGroup
            group={xAxisPeltierOptions}
            on:change={changeXAxis}
            type="horizontal" />
        </div>
      {/if}
      <h3>Результаты измерений</h3>
      {#each ['voltageProbe', 'currentProbe', 'deltaTemp'] as param}
        <div class="result">
          <span class="symbol">
            {$data[param].symbol},
            <em class="units">{$data[param].units}</em>
            :
          </span>
          <strong class="value">
            {$data[param].value.toFixed(+initialData[param].divider
                .toExponential()
                .split('e')[1])}
          </strong>
        </div>
      {/each}
    </div>
    <div class="chart">
      <canvas id="effects-chart" width="500" height="350" />
      <Button style="width: 9rem" on:click={toggleDrawing}>
        {isDrawing ? 'Стоп' : 'Старт'}
      </Button>
      <div class="buttons">
        <SaveButton disabled={!logCreated} />
        <Button style="width: 9rem" on:click={goBack}>Назад</Button>
      </div>
    </div>
  </main>
</div>

<style>
  main {
    display: flex;
    justify-content: space-between;
    padding: 0 6.4rem 2.4rem;
  }
  .controls {
    flex: 1 1 40%;
    max-width: 32rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .controls :global(button) {
    margin-top: auto;
    align-self: flex-start;
  }
  .chart {
    max-width: 54rem;
    flex: 1 1 60%;
    text-align: right;
  }
  .symbol {
    display: inline-block;
    width: 8rem;
  }

  .temp-value {
    color: var(--bg-color);
    padding: 1rem;
    border-radius: 4px;
    display: inline-block;
    white-space: nowrap;
    min-width: 8rem;
    text-align: center;
  }
  .temp-value.Hot {
    background-color: var(--corporate-orange);
  }
  .temp-value.Cool {
    background-color: var(--corporate-blue);
  }
  .param-temp,
  .range {
    margin: 1rem 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .result {
    margin-bottom: 0.8rem;
  }
  h3 {
    text-align: center;
    font-size: 2rem;
    margin-top: 3rem;
  }
  .buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1.6rem;
  }
  .mode {
    margin-top: auto;
  }
  .mode-controls {
    display: flex;
    justify-content: space-between;
  }
</style>
