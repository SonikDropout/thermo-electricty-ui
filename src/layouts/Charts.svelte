<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import RadioGroup from '../molecules/RadioGroup';
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

  let saveActive,
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
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: xCaption, y: yCaption })
    );
    chart.options.onClick = chart.resetZoom();
  }

  ipcRenderer
    .on('usbConnect', () => (saveActive = true))
    .on('usbDisconnect', () => (saveActive = false));

  const faceOptions = [
    { label: 'Охлаждающая сторона', value: 'Cool' },
    { label: 'Нагревающая сторона', value: 'Hot' },
  ];

  const sensorsOptions = {
    name: 'sensors',
    elements: [
      {
        value: 0,
        label: 'Терморезистор',
        name: 'thermoresistor',
        icon: 'thermistor',
      },
      {
        value: 1,
        label: 'Термопара',
        name: 'thermocouple',
        icon: 'thermocouple',
      },
      { value: 2, label: 'Термистор', name: 'thermistor', icon: 'thermistor' },
    ],
  };

  let selectedFace = 'Cool',
    selectedSensor = sensorsOptions.elements[0];

  $: sensorEntry = selectedSensor.name + selectedFace;
  $: yCaption = $data[sensorEntry].symbol + ', ' + $data[sensorEntry].units;
  $: updateYAxis(yCaption);

  function selectFace(f) {
    selectedFace = f;
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
      xCaption,
      yCaption
    );
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

  function saveExcel() {
    ipcRenderer.send('saveFile');
  }
</script>

<div class="layout">
  <header>Построение графиков</header>
  <main>
    <div class="selects">
      <Select
        onChange={selectFace}
        options={faceOptions}
        defaultValue={selectedFace} />
      <RadioGroup group={sensorsOptions} onChange={selectSensor} />
      <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
    </div>
    <div class="chart">
      <canvas id="chart" width="500" height="400" />
    </div>
  </main>
  <footer>
    <Button on:click={goBack}>Назад</Button>
    <Button on:click={saveExcel} disabled={!saveActive}>
      Сохранить данные на usb-устройство
    </Button>
  </footer>
</div>

<style>
  main {
    display: flex;
    align-items: stretch;
    justify-content: space-evenly;
    padding-top: 2rem;
  }
  .selects {
    flex: 1 1 40%;
    padding: 0 4rem;
    max-width: 40rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  .selects :global(button) {
    margin-top: auto;
  }
  .selects :global(.radio-group) {
    margin-top: 2rem;
  }
  .chart {
    flex: 1 1 60%;
    max-width: 50rem;
    padding-right: 4.8rem;
  }
  canvas {
    width: 100%;
    height: 100%;
  }
  footer {
    padding: var(--gutter-width) 8rem;
  }
</style>
