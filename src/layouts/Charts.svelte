<script>
  import Chart from "../organisms/Chart/index";
  import Select from "../atoms/Select";
  import Button from "../atoms/Button";
  import xlsLogger from "../utils/XLSLogger";
  import usbDetector from "../utils/USBDetector";
  export let goBack;

  let MSPath = usbDetector.storagePath,
    points;

  usbDetector.on("connect", path => (MSPath = path));
  usbDetector.on("remove", () => (MSPath = void 0));

  const faceOptions = [
    { label: "Охлаждающая сторона", value: 0 },
    { label: "Нагревающая сторона", value: 1 }
  ];

  const sensorsOptions = [
    { label: "Терморезистор", value: 0 },
    { label: "Термистор", value: 1 },
    { label: "Термопара", value: 2 }
  ];

  let selectedFace = faceOptions[0];
  let selectedSensor = sensorsOptions[0];

  function selectFace(e) {
    selectedFace = faceOptions[+e.target.dataset.value];
  }

  function selectSensor(e) {
    selectedSensor = sensorsOptions[+e.target.dataset.value];
  }

  function startDrawing() {
    // pass
  }

  function saveExcel() {
    xlsLogger.saveLogTo(MSPath);
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
      <Select on:change={selectFace} options={faceOptions} />
      <Select on:change={selectSensor} options={sensorsOptions} />
      <Button on:click={startDrawing}>Старт</Button>
    </div>
    <Chart xCaption="T, &#x2103;" yCaption="R" {points} />
  </main>
  <footer>
    <Button on:click={saveExcel} disabled={!MSPath}>
      Сохранить данные на usb-устройство
    </Button>
    <Button on:click={goBack}>Назад</Button>
  </footer>
</div>
