<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import RadioGroup from '../molecules/RadioGroup';
  import SaveButton from '../organisms/SaveButton';
  import { data } from '../stores';
  import { ipcRenderer } from 'electron';
  import { capitalize } from '../utils/others';
  import { PELTIER_PARAMS } from '../constants';
  import Chart from 'chart.js';
  import Zoom from 'chartjs-plugin-zoom';
  import { onMount, onDestroy } from 'svelte';
  import configureChart from './chart.config';
  export let goBack;

  const xCaption = 'T, ' + PELTIER_PARAMS.temperatureHot.units;

  let logCreated,
    width = 500,
    height = 350,
    chart,
    points = [],
    unsubscribeData,
    yCaption,
    isDrawing;

  onMount(createChart);
  onDestroy(() => chart && chart.destroy());

  function createChart() {
    chart = new Chart(
      document.getElementById('measures-chart').getContext('2d'),
      configureChart(points, { x: xCaption, y: yCaption })
    );
    chart.options.onClick = chart.resetZoom;
  }

  const faceOptions = {
    name: 'face',
    elements: [
      { label: '', value: 'Cool', icon: 'cool' },
      { label: '', value: 'Hot', icon: 'hot' },
    ],
  };

  const sensorsOptions = {
    name: 'sensors',
    elements: [
      {
        value: 0,
        label: 'Терморезистор',
        name: 'thermoresistor',
      },
      {
        value: 1,
        label: 'Термопара',
        name: 'thermocouple',
      },
      { value: 2, label: 'Термистор', name: 'thermistor' },
    ],
  };

  let selectedFace = 'Cool',
    selectedSensor = sensorsOptions.elements[0];

  $: sensorEntry = selectedSensor.name + selectedFace;
  $: yCaption = $data[sensorEntry].symbol + ', ' + $data[sensorEntry].units;
  $: updateYAxis(yCaption);

  function selectFace(e) {
    selectedFace = e.target.value;
  }

  function selectSensor(e) {
    selectedSensor = sensorsOptions.elements[e.target.value];
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

  function updateYAxis(caption) {
    if (!chart) return;
    chart.options.scales.yAxes[0].scaleLabel.labelString = caption;
    chart.update();
  }

  function startDrawing() {
    isDrawing = true;
    ipcRenderer.send(
      'createFile',
      `TE-${selectedFace}-${capitalize(selectedSensor.name)}}`,
      [xCaption, yCaption]
    );
    logCreated = true;
    unsubscribeData = data.subscribe(addPoint);
  }

  function addPoint(data) {
    const point = {
      x: data['temperature' + selectedFace].value,
      y: data[selectedSensor.name + selectedFace].value,
    };
    writeExcel(point);
    updateChartData(point);
  }

  function writeExcel(point) {
    ipcRenderer.send('excelRow', [point.x, point.y]);
  }

  function updateChartData(point) {
    points.push(point);
    chart.update();
  }
</script>

<div class="layout">
  <header>Построение графиков</header>
  <main>
    <div class="selects">
      <RadioGroup
        group={faceOptions}
        on:change={selectFace}
        type="horizontal" />
      <RadioGroup
        group={sensorsOptions}
        on:change={selectSensor}
        type="horizontal" />
    </div>
    <div class="chart">
      <canvas id="measures-chart" height="130" />
    </div>
  </main>
  <footer>
    <Button on:click={goBack}>Назад</Button>
    <SaveButton disabled={!logCreated} />
    <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
  </footer>
</div>

<style>
  main {
    padding: 0 7.5rem;
  }
  .selects {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--gutter-width);
  }
  canvas {
    width: 100%;
    height: 100%;
  }
  footer {
    padding: var(--gutter-width) 7.5rem;
  }
</style>
