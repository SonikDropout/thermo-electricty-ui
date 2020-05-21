<script>
  import RangeInput from '../molecules/RangeInput';
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import SaveButton from '../organisms/SaveButton';
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

  let logCreated,
    startDisabled = true,
    chart,
    points = [],
    setPower = 0,
    unsubscribeData,
    isDrawing;

  ipcRenderer
    .on('usbConnect', () => (saveDisabled = false))
    .on('usbDisconnect', () => (saveDisabled = true));

  const effectsOptions = [
    { label: 'Эффект Зеебека', value: 0 },
    { label: 'Эффект Пельтье', value: 1 },
  ];

  const deltaTCaption = '\u0394T, \u02daC';
  const voltageCaption = 'U, B';
  const currentCaption = 'I, A';

  $: yCaption = selectedEffect.value ? deltaTCaption : voltageCaption;
  $: xCaption = selectedEffect.value ? currentCaption : deltaTCaption;

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
    ipcRenderer.send('serialCommand', COMMANDS.turnOnProbePeltier);
    ipcRenderer.send('serialCommand', COMMANDS.constantTempProbePeltier);
  }

  function startSeebeckResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.constantPowerProbePeltier);
    ipcRenderer.send('serialCommand', COMMANDS.turnOnHotPeltier);
    ipcRenderer.send('serialCommand', COMMANDS.turnOnCoolPeltier);
  }

  function stopResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.turnOffAllPeltier);
  }

  function changePower(P) {
    setPower = P;
    if (!selectedEffect.value) {
      ipcRenderer.send('serialCommand', ...COMMANDS.setPowerHotPeltier(P));
      ipcRenderer.send('serialCommand', ...COMMANDS.setPowerCoolPeltier(P));
    } else {
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
    startLog();
    if (!selectedEffect.value) startSeebeckResearch();
    else startPeltierResearch();
    unsubscribeData = data.subscribe(addPoint);
  }

  function startLog() {
    let headers;
    if (selectedEffect.value) headers = [currentCaption, deltaTCaption];
    else headers = [deltaTCaption, voltageCaption];
    ipcRenderer.send(
      'createFile',
      `TE-${selectedEffect.label.replace(' ', '-')}`,
      headers
    );
    logCreated = true;
  }

  function addPoint(data) {
    const deltaTemp = data.deltaTemp.value;
    const point = {
      y: selectedEffect.value ? deltaTemp : data.voltageProbe.value,
      x: !selectedEffect.value ? deltaTemp : data.currentProbe.value,
    };
    writeExcel(point);
    updateChart(point);
  }

  function writeExcel(point) {
    ipcRenderer.send('excelRow', [point.x, point.y]);
  }

  function updateChart(point) {
    points.push(point);
    chart.update();
  }

  const modeOptions = [
    {
      label: 'по мощности',
      value: 0,
      inputLabel: 'Задание Мощности, % от макс',
    },
    { label: 'по температуре', value: 1, inputLabel: 'Задание T, \u2103' },
  ];

  let selectedMode = $data.modeCool.value;

  $: variableParams = {
    Cool: getStoreValue(data)[
      (selectedMode ? 'setTemperature' : 'load') + 'Cool'
    ].value,

    Hot: getStoreValue(data)[(selectedMode ? 'setTemperature' : 'load') + 'Hot']
      .value,
  };

  function switchPeltierMode(mode) {
    selectedMode = +mode;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[`constant${MODES[selectedMode]}CoolPeltier`]
    );
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[`constant${MODES[selectedMode]}HotPeltier`]
    );
  }

  function changeVariableParam(v, name) {
    ipcRenderer.send(
      'serialCommand',
      ...COMMANDS[`set${MODES[selectedMode]}${name}Peltier`](v)
    );
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
      <div class="param-temp">
        <span class="temp-label">Температура нагревающейся пластины:</span>
        <strong class="temp-value hot">
          {$data.temperatureHot.value}{$data.temperatureHot.units}
        </strong>
      </div>
      <div class="param-temp">
        <span class="temp-label">Температура охлаждающейся пластины:</span>
        <strong class="temp-value cool">
          {$data.temperatureCool.value}{$data.temperatureCool.units}
        </strong>
      </div>
      {#if !selectedEffect.value}
        {#each ['Cool', 'Hot'] as name}
          <div class="range-label">Режим работы {name} пластины</div>
          <div class="range">
            <Select
              onChange={switchPeltierMode}
              defaultValue={selectedMode}
              options={modeOptions} />
            <RangeInput
              {name}
              defaultValue={variableParams[name]}
              onChange={changeVariableParam}
              range={PELTIER_CONSTRAINTS[MODES[selectedMode] + name]} />
          </div>
        {/each}
        <div class="range">
          <span class="range-label">
            Установка тока, {$data.currentProbe.units}
          </span>
          <RangeInput
            step={0.1}
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
        <div class="range-spacer" />
      {/if}
      <h3>Результаты измерений</h3>
      {#each ['voltageProbe', 'currentProbe', 'deltaTemp'] as param}
        <div class="result">
          <span class="symbol">
            {$data[param].symbol},
            <em class="units">{$data[param].units}</em>
            :
          </span>
          <strong class="value">{$data[param].value}</strong>
        </div>
      {/each}
    </div>
    <div class="chart">
      <div>
        <canvas id="effects-chart" width="500" height="350" />
      </div>
      <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
    </div>
  </main>
  <footer>
    <Button on:click={goBack}>Назад</Button>
    <SaveButton disabled={!logCreated} />
  </footer>
</div>

<style>
  main {
    display: flex;
    justify-content: space-between;
    padding: 0 8rem;
  }
  .controls {
    flex: 1 1 40%;
    max-width: 36rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .controls :global(button) {
    margin-top: auto;
    align-self: flex-start;
  }
  main :global(.chart) {
    max-width: 50rem;
    flex: 1 1 60%;
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
  .temp-value.hot {
    background-color: var(--corporate-orange);
  }
  .temp-value.cool {
    background-color: var(--corporate-blue);
  }
  .param-temp,
  .range {
    margin: 1rem 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .range-spacer {
    margin-top: 1rem;
    height: 3.2rem;
  }
  .result {
    margin-bottom: 0.8rem;
  }
  footer {
    padding: var(--gutter-width) 8rem;
  }
  h3 {
    text-align: center;
    font-size: 2rem;
  }
</style>
