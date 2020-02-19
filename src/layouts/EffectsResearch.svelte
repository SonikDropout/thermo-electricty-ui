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

  const I = "I, A";
  const deltaT = "\u0394T, \u02daC";

  $: xCaption = selectedEffect.value ? deltaT : I;
  $: yCaption = selectedEffect.value ? I : deltaT;

  let selectedEffect = effectsOptions[0];

  function selectEffect(e) {
    selectedEffect = effectsOptions[e];
    ipcRenderer.send("serialCommand", COMMANDS.turnOffAllPeltier);
    if (e) {
      ipcRenderer.send("serialCommand", COMMANDS.turnOnCoolPeltier);
      ipcRenderer.send("serialCommand", COMMANDS.turnOnHotPeltier);
    } else {
      ipcRenderer.send("serialCommand", COMMANDS.turnOnProbePeltier);
    }
  }

  function changePower(P) {
    ipcRenderer.send("serialCommand", ...COMMANDS.setPowerCoolPeltier(P));
    ipcRenderer.send("serialCommand", ...COMMANDS.setPowerHotPeltier(P));
  }

  function changeCurrent(I) {
    ipcRenderer.send("serialCommand", ...COMMANDS.setCurrentProbePeltier(I));
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
      <div class="result">
        <span class="symbol">
          U,
          <em class="units">{$data.voltageProbe.units}</em>
          :
        </span>
        <strong class="value">{0}</strong>
      </div>
      <div class="result">
        <span class="symbol">
          I,
          <em class="units">{$data.currentProbe.units}</em>
          :
        </span>
        <strong class="value">{0}</strong>
      </div>
      <div class="result">
        <span class="symbol">
          T,
          <em class="units">{$data.temperatureCool.units}</em>
          :
        </span>
        <strong class="value">{0}</strong>
      </div>
      <Button on:click={toggleDrawing}>{isDrawing ? 'Стор' : 'Старт'}</Button>
    </div>
    <Chart {xCaption} {yCaption} {xPoints} {yPoints} />
  </main>
  <footer>
    <Button on:click={goBack}>Назад</Button>
    <Button on:click={saveExcel} disabled={saveActive}>
      Сохранить данные на usb-устройство
    </Button>
  </footer>
</div>
