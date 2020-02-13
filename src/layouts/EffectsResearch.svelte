<script>
  import Chart from "../organisms/Chart/index";
  import RangeInput from "../molecules/RangeInput";
  import Select from "../molecules/select";
  import Button from "../atoms/Button";
  import { ipcRenderer } from "electron";
  import { COMMANDS, PELTIER_CONSTRAINTS } from "../constants";
  import { data } from "../stores";
  export let goBack;

  let saveActive,
    xPoints = [],
    yPoints = [],
    isDrawing;

  $: deltaTemp = $data.temperatureHot.value - $data.temperatureCool.value;

  ipcRenderer
    .on("usbConnect", () => (saveActive = true))
    .on("usbDisconnect", () => (saveActive = false));

  const effectsOptions = [
    { label: "Эффект Пельтье", value: 0 },
    { label: "Эффект Зеебека", value: 1 }
  ];

  let selectedEffect = effectsOptions[0];

  function selectEffect(e) {
    selectedEffect = effectsOptions[+e.target.dataset.value];
  }

  function changePower(e) {
    const P = e.target.value;
    ipcRenderer.send("serialCommand", COMMANDS.setPowerCoolPeltier(P));
    ipcRenderer.send("serialCommand", COMMANDS.setPowerHotPeltier(P));
  }

  function changeCurrent(e) {
    const I = e.traget.value;
    ipcRenderer.send("serialCommand", COMMANDS.setCurrentProbePeltier(I));
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
    let headers = ["\u0394T, \u2103", "I, A"];
    if (!selectedEffect.value) headers = headers.reverse();
    ipcRenderer.send(
      "startFileWrite",
      `TE-${selectedEffect.label.replace(" ", "-")}_${getFileDate()}`,
      headers
    );
    data.subscribe(saveExcelData);
    data.subscribe(updateChartData);
  }

  function saveExcelData(data) {
    let rowEntries = [deltaTemp, data.currentProbe.value];
    if (!selectedEffect.value) rowEntries = rowEntries.reverse();
    ipcRenderer.send("excelRow", rowEntries);
  }

  function updateChartData(data) {
    const I = data.currentProbe.value;
    xPoints = xPoints.concat(selectedEffect.value ? deltaTemp : I);
    yPoints = yPoints.concat(!selectedEffect.value ? deltaTemp : I);
  }

  function saveExcel() {
    ipcRenderer.send("saveFile");
  }
</script>

<style>
  main {
    display: flex;
    padding-top: var(--gutter-width);
    justify-content: space-evenly;
  }
  .selects {
    flex: 1 1 40%;
    max-width: 40rem;
    padding: 0 4.8rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .selects :global(button) {
    margin-top: auto;
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
</style>

<div class="layout">
  <header>Исследование эффектов Пельтье и Зеебека</header>
  <main>
    <div class="selects">
      <Select
        onChange={selectEffect}
        options={effectsOptions}
        selected={selectedEffect} />
      <div class="value">
        <span class="label">Температура нагревающейся пластины:</span>
        <strong class="value">{$data.temperatureHot.value}</strong>
        <em class="units">{'\u2103'}</em>
      </div>
      <div class="value">
        <span class="label">Температура охлаждающейся пластины:</span>
        <strong class="value">{$data.temperatureCool.value}</strong>
        <em class="units">{'\u2103'}</em>
      </div>
      {#if selectedEffect.value}
        <RangeInput
          on:change={changePower}
          range={PELTIER_CONSTRAINTS.PowerHot}>
          Мощьность модуля Пелтье, % от макс
        </RangeInput>
      {:else}
        <RangeInput
          on:change={changeCurrent}
          range={PELTIER_CONSTRAINTS.CurrentProbe}>
          Установка тока, А
        </RangeInput>
      {/if}
      <h3>Результаты измерений</h3>
      <div class="result">
        <span class="symbol">U,<em class="units"> B</em>:</span>
        <strong class="value">{0}</strong>
      </div>
      <div class="result">
        <span class="symbol">I,<em class="units"> A</em>:</span>
        <strong class="value">{0}</strong>
      </div>
      <div class="result">
        <span class="symbol">T,<em class="units"> {'\u2103'}</em>:</span>
        <strong class="value">{0}</strong>
      </div>
      <Button on:click={toggleDrawing}>{isDrawing ? 'Старт' : 'Стоп'}</Button>
    </div>
    <Chart xCaption="T, &#x2103;" yCaption="R" {xPoints} {yPoints} />
  </main>
  <footer>
    <Button on:click={saveExcel} disabled={saveActive}>
      Сохранить данные на usb-устройство
    </Button>
    <Button on:click={goBack}>Назад</Button>
  </footer>
</div>
