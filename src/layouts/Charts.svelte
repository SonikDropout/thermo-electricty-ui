<script>
  import Chart from "../organisms/Chart/index";
  import Select from "../molecules/select";
  import Button from "../atoms/Button";
  import RadioGroup from "../molecules/RadioGroup";
  import { data } from "../stores";
  import { ipcRenderer } from "electron";
  import { getFileDate, capitalize } from "../utils/others";
  export let goBack;

  let saveActive, xPoints = [], yPoints = [], isDrawing;

  ipcRenderer.on("usbConnect", () => (saveActive = true))
    .on("usbDisconnect", () => (saveActive = false));

  const faceOptions = [
    { label: "Охлаждающая сторона", value: "Cool" },
    { label: "Нагревающая сторона", value: "Hot" }
  ];

  const sensorsOptions = {
    name: "sensors",
    elements: [
      { label: "Терморезистор", value: "thermoresistor" },
      { label: "Термистор", value: "thermistor" },
      { label: "Термопара", value: "thermocouple" }
    ]
  };

  let selectedFace = faceOptions[0],
    selectedSensor;

  function selectFace(e) {
    const name = e.target.datset.value;
    selectedFace = faceOptions[+(name == "Hot")];
  }

  function selectSensor(e) {
    selectedSensor = sensorsOptions[+e.target.dataset.value];
  }

  function toggleDrawing() {
    if (isDrawing) stopDrawing();
    else startDrawing();
  }

  function stopDrawing() {
    data.unsubscribe(sendExcelData);
    data.unsubscribe(updateChartData);
    xPoints = [];
    yPoints = [];
    isDrawing = false;
  }

  function startDrawing() {
    isDrawing = true;
    ipcRenderer.send(
      "startFileWrite",
      `TE-${selectedFace.value}-${capitalize(selectedSensor)}_${getFileDate()}`,
      "T, \u2103",
      "R, Ом"
    );
    data.subscribe(saveExcelData);
    data.subscribe(updateChartData);
  }

  function saveExcelData(data) {
    ipcRenderer.send(
      "excelRow",
      data["temperature" + selectFace.value].value,
      data[selectedSensor + selectFace.value].value
    );
  }

  function updateChartData(data) {
    xPoints = xPoints.concat(data['temperature' + selectFace.value].value);
    yPoints = yPoints.concat(data[selectedSensor + selectFace.value].value);
  }

  function saveExcel() {
    ipcRenderer.send("saveFile");
  }
</script>

<style>
  main {
    display: flex;
    align-items: stretch;
    justify-content: space-evenly;
  }
  .selects {
    flex: 1 1 40%;
    padding: 0 4.8rem;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: flex-start;
  }
  main :global(.chart) {
    flex: 1 1 60%;
    padding-right: 4.8rem;
  }
</style>

<div class="layout">
  <header>Постоение графиков</header>
  <main>
    <div class="selects">
      <Select
        onChange={selectFace}
        options={faceOptions}
        selected={selectedFace} />
      <RadioGroup group={sensorsOptions} />
      <Button on:click={toggleDrawing}>{isDrawing ? 'Старт' : 'Стоп'}</Button>
    </div>
    <Chart xCaption="T, &#x2103;" yCaption="R" {xPoints} {yPoints} />
  </main>
  <footer>
    <Button on:click={saveExcel} disabled={!saveActive}>
      Сохранить данные на usb-устройство
    </Button>
    <Button on:click={goBack}>Назад</Button>
  </footer>
</div>
