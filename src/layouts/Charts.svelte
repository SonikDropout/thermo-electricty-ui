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
  import PointsStorage from '../utils/PointsStorage';
  export let goBack;

  const xCaption = 'T, ' + PELTIER_PARAMS.temperatureHot.units;
  const pointsStorage = new PointsStorage();

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
      configureChart(pointsStorage.points, { x: xCaption, y: selectedSensor.caption })
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
        caption:
          $data.thermoresistorCool.symbol +
          ', ' +
          $data.thermoresistorCool.units,
      },
      {
        value: 1,
        label: 'Термопара',
        name: 'thermocouple',
        caption:
          $data.thermocoupleCool.symbol + ', ' + $data.thermocoupleCool.units,
      },
      {
        value: 2,
        label: 'Термистор',
        name: 'thermistor',
        caption:
          $data.thermistorCool.symbol + ', ' + $data.thermistorCool.units,
      },
    ],
  };

  const storedValues = faceOptions.elements
    .map(face =>
      ['temperature' + face.value].concat(
        sensorsOptions.elements.map(sensor => sensor.name + face.value)
      )
    )
    .flat();

  let selectedFace = 'Cool',
    selectedSensor = sensorsOptions.elements[0];

  function selectFace(e) {
    selectedFace = e.target.value;
    updateXAxis();
  }

  function selectSensor(e) {
    selectedSensor = sensorsOptions.elements[e.target.value];
    updateYAxis();
  }

  function toggleDrawing() {
    if (isDrawing) stopDrawing();
    else startDrawing();
  }

  function stopDrawing() {
    unsubscribeData();
    pointsStorage.drain();
    isDrawing = false;
  }

  function updateXAxis() {
    pointsStorage.setX(
      storedValues.indexOf('temperature' + selectedFace.value)
    );
    chart.data.datasets[0].data = pointsStorage.points;
    chart.update();
  }

  function updateYAxis() {
    if (!chart) return;
    pointsStorage.setY(
      storedValues.indexOf(selectedSensor.name + selectedFace.value)
    );
    chart.data.datasets[0].data = pointsStorage.points;
    chart.options.scales.yAxes[0].scaleLabel.labelString = selectedSensor.caption;
    chart.update();
  }

  function startDrawing() {
    isDrawing = true;
    ipcRenderer.send(
      'createFile',
      `Thermo-Electricity-Sensors`,
      storedValues.map(key => $data[key].symbol + ', ' + $data[key].units)
    );
    logCreated = true;
    unsubscribeData = data.subscribe(addRow);
  }

  function addRow(data) {
    const row = storedValues.map(key => data[key].value);
    writeExcel(row);
    updateChartData();
  }

  function writeExcel(row) {
    ipcRenderer.send('excelRow', row);
  }

  function updateChartData() {
    chart.data.datasets[0].data = pointsStorage.points;
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
