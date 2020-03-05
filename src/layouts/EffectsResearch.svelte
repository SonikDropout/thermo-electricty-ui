<script>
  import RangeInput from '../molecules/RangeInput';
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import { COMMANDS, PELTIER_CONSTRAINTS } from '../constants';
  import { data } from '../stores';
  import Chart from 'chart.js';
  import Zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  export let goBack;

  onMount(createChart);

  function createChart() {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: xCaption, y: yCaption })
    );
    chart.options.onClick = chart.resetZoom();
  }

  let saveDisabled=true,
    startDisabled = true,
    chart,
    points = [],
    unsubscribeData,
    isDrawing;

  $: deltaTemp = $data.temperatureHot.value - $data.temperatureCool.value;

  ipcRenderer
    .on('usbConnect', () => (saveDisabled = false))
    .on('usbDisconnect', () => (saveDisabled = true));

  const effectsOptions = [
    { label: 'Эффект Пельтье', value: 0 },
    { label: 'Эффект Зеебека', value: 1 },
  ];

  const I = 'I, A';
  const deltaT = '\u0394T, \u02daC';

  $: xCaption = selectedEffect.value ? deltaT : I;
  $: yCaption = selectedEffect.value ? I : deltaT;

  $: updateAxis('x', xCaption);
  $: updateAxis('y', yCaption);

  function updateAxis(axis, caption) {
    if (!chart) return;
    chart.options.scales[axis + 'Axes'][0].scaleLabel.labelString = caption;
    chart.update();
  }

  let selectedEffect = effectsOptions[0];

  function selectEffect(e) {
    startDisabled = false;
    selectedEffect = effectsOptions[e];
    ipcRenderer.send('serialCommand', COMMANDS.turnOffAllPeltier);
    if (e) {
      ipcRenderer.send('serialCommand', COMMANDS.turnOnCoolPeltier);
      ipcRenderer.send('serialCommand', COMMANDS.turnOnHotPeltier);
    } else {
      ipcRenderer.send('serialCommand', COMMANDS.turnOnProbePeltier);
    }
  }

  function changePower(P) {
    ipcRenderer.send('serialCommand', ...COMMANDS.setPowerCoolPeltier(P));
    ipcRenderer.send('serialCommand', ...COMMANDS.setPowerHotPeltier(P));
  }

  function changeCurrent(I) {
    ipcRenderer.send('serialCommand', ...COMMANDS.setCurrentProbePeltier(I));
  }

  function toggleDrawing() {
    if (isDrawing) stopDrawing();
    else startDrawing();
  }

  function stopDrawing() {
    unsubscribeData();
    points = [];
    isDrawing = false;
  }

  function startDrawing() {
    isDrawing = true;
    let headers = ['\u0394T, \u2103', 'I, A'];
    if (!selectedEffect.value) headers = headers.reverse();
    ipcRenderer.send(
      'createFile',
      `TE-${selectedEffect.label.replace(' ', '-')}`,
      headers
    );
    unsubscribeData = data.subscribe(addPoint);
  }

  function addPoint(data) {
    const point = {
      x: selectedEffect.value ? deltaTemp : I,
      y: !selectedEffect.value ? deltaTemp : I,
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
      <Select onChange={selectEffect} options={effectsOptions} />
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
      {#if selectedEffect.value}
        <div class="range">
          <span class="range-label">Мощность модуля Пелтье, % от макс</span>
          <RangeInput
            onChange={changePower}
            range={PELTIER_CONSTRAINTS.PowerHot} />
        </div>
      {:else}
        <div class="range">
          <span class="range-label">
            Установка тока, {$data.currentProbe.units}
          </span>
          <RangeInput
            onChange={changeCurrent}
            range={PELTIER_CONSTRAINTS.CurrentProbe} />
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
          <strong class="value">{$data[param].value}</strong>
        </div>
      {/each}
      <Button on:click={toggleDrawing} disabled={startDisabled}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
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
    padding-top: var(--gutter-width);
    justify-content: space-evenly;
  }
  .controls {
    flex: 1 1 40%;
    max-width: 40rem;
    padding: 0 4rem;
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
    padding-right: 4.8rem;
  }
  .symbol {
    display: inline-block;
    width: 5rem;
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
