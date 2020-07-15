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

  let logId,
    width = 500,
    height = 350,
    chart,
    points = [],
    unsubscribeData,
    yCaption,
    timeStart,
    isDrawing;

  onMount(createChart);
  onDestroy(() => chart && chart.destroy());

  function createChart() {
    chart = new Chart(
      document.getElementById('measures-chart').getContext('2d'),
      configureChart(pointsStorage.points, {
        x: xCaption,
        y: selectedSensor.caption,
      })
    );
    chart.options.onClick = chart.resetZoom;
  }

  const faceOptions = {
    name: 'face',
    elements: [
      { label: '', value: 'Hot', icon: 'hot' },
      { label: '', value: 'Cool', icon: 'cool' },
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
    pointsStorage.setX(storedValues.indexOf('temperature' + selectedFace));
    pointsStorage.setY(
      storedValues.indexOf(selectedSensor.name + selectedFace)
    );
    chart.data.datasets[0].data = pointsStorage.points;
    chart.update();
  }

  function updateYAxis() {
    if (!chart) return;
    pointsStorage.setY(
      storedValues.indexOf(selectedSensor.name + selectedFace)
    );
    chart.data.datasets[0].data = pointsStorage.points;
    chart.options.scales.yAxes[0].scaleLabel.labelString =
      selectedSensor.caption;
    chart.update();
  }

  function startDrawing() {
    isDrawing = true;
    timeStart = 0;
    startLogging();
    unsubscribeData = data.subscribe(addRow);
  }

  function startLogging() {
    logId = `Thermo-Electricity-Sensors`,
    ipcRenderer.send(
      'createFile',
      logId,
      ['Время, с'].concat(
        storedValues.map(
          key =>
            `${$data[key].symbol}(${key.endsWith('Cool') ? 'хол.' : 'гор.'}), ${
              $data[key].units
            }`
        )
      )
    );
  }

  function addRow(data) {
    const row = storedValues.map(key => data[key].value);
    pointsStorage.addRow(row);
    writeExcel([timeStart++].concat(row));
    updateChartData();
  }

  function writeExcel(row) {
    ipcRenderer.send('excelRow', logId, row);
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
      <canvas id="measures-chart" height="120" />
    </div>
  </main>
  <footer>
    <Button on:click={goBack}>Назад</Button>
    <SaveButton  {logId} />
    <Button style="width:8rem" on:click={toggleDrawing}>
      {isDrawing ? 'Стоп' : 'Старт'}
    </Button>
  </footer>
</div>

<style>
  main {
    padding: 0 6.4rem;
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
    padding: var(--gutter-width) 6.4rem;
  }
</style>
