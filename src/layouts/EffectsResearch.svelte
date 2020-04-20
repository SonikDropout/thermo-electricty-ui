<script>
  import RangeInput from '../molecules/RangeInput';
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import SaveButton from '../organisms/SaveButton';
  import { ipcRenderer } from 'electron';
  import { COMMANDS, PELTIER_CONSTRAINTS } from '../constants';
  import { data } from '../stores';
  import Chart from 'chart.js';
  import Zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount, onDestroy } from 'svelte';
  export let goBack;

  onMount(createChart);
  onDestroy(() => chart && chart.destroy());

  function createChart() {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: xCaption, y: yCaption })
    );
    chart.options.onClick = chart.resetZoom();
  }

  let saveDisabled = true,
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
    { label: 'Эффект Пельтье', value: 0 },
    { label: 'Эффект Зеебека', value: 1 },
  ];

  const voltageCaption = 'U, B';
  const deltaTCaption = '\u0394T, \u02daC';

  $: xCaption = selectedEffect.value ? deltaTCaption : voltageCaption;
  $: yCaption = selectedEffect.value ? voltageCaption : deltaTCaption;

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
  }

  function startSeebeckResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.turnOnHotPeltier);
    ipcRenderer.send('serialCommand', COMMANDS.turnOnCoolPeltier);
  }

  function stopResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.turnOffAllPeltier);
  }

  function changePower(P) {
    setPower = P;
    if (selectedEffect.value) {
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
    points = [];
    isDrawing = false;
  }

  function startDrawing() {
    isDrawing = true;
    startLog();
    if (selectedEffect.value) startSeebeckResearch();
    else startPeltierResearch();
    unsubscribeData = data.subscribe(addPoint);
  }

  function startLog() {
    let headers = [deltaTCaption, voltageCaption];
    if (!selectedEffect.value) headers = headers.reverse();
    ipcRenderer.send(
      'createFile',
      `TE-${selectedEffect.label.replace(' ', '-')}`,
      headers
    );
  }

  function addPoint(data) {
    const voltage = data.voltageProbe.value;
    const deltaTemp = data.deltaTemp.value;
    const point = {
      x: selectedEffect.value ? deltaTemp : voltage,
      y: !selectedEffect.value ? deltaTemp : voltage,
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

  function saveExcel() {
    ipcRenderer.send('saveFile');
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
      <div class="range">
        <span class="range-label">
          Мощность {selectedEffect.value ? 'модулей' : 'модуля'} <br> Пельтье, % от
          макс
        </span>
        <RangeInput
          onChange={changePower}
          defaultValue={setPower}
          range={PELTIER_CONSTRAINTS.PowerHot} />
      </div>
      {#if !selectedEffect.value}
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
      <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
    </div>
    <div class="chart">
      <canvas id="chart" width="500" height="350" />
    </div>
  </main>
  <footer>
    <Button on:click={goBack}>Назад</Button>
    <Button on:click={saveExcel} disabled={saveDisabled}>
      Сохранить данные на usb-устройство
    </Button>
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
