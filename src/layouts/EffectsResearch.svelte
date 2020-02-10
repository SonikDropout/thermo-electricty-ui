<script>
  import Chart from "../organisms/Chart/index";
  import RangeInput from "../molecules/RangeInput";
  import Select from "../atoms/Select";
  import Button from "../atoms/Button";
  import xlsLogger from "../utils/XLSLogger";
  import usbDetector from "../utils/USBDetector";
  export let goBack;

  let MSPath = usbDetector.storagePath,
    points;

  usbDetector.on("connect", path => (MSPath = path));
  usbDetector.on("remove", () => (MSPath = void 0));

  const effectsOptions = [
    { label: "Эффект Пелтье", value: 0 },
    { label: "Эффект Зеебека", value: 1 }
  ];

  let selectedEffect = effectsOptions[0];

  function selectEffect(e) {
    selectedEffect = effectsOptions[+e.target.dataset.value];
  }

  function changePower() {
    // pass
  }

  function changeCurrent() {
    // pass
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
  }
  .selects {
    flex: 1 1 40%;
  }
  main :global(.chart) {
    flex: 1 1 60%;
  }
</style>

<div class="layout">
  <header>Исследование эффектов Пелтье и Зеебека</header>
  <main>
    <div class="selects">
      <Select on:change={selectEffect} options={effectsOptions} />
      <div class="value">
        <span class="label">Температура нагревающейся пластины:</span>
        <strong class="value">{0}</strong>
        <em class="units">{'\u2103'}</em>
      </div>
      <div class="value">
        <span class="label">Температура охлаждающейся пластины:</span>
        <strong class="value">{0}</strong>
        <em class="units">{'\u2103'}</em>
      </div>
      {#if selectedEffect.value}
        <RangeInput on:change={changePower}>
          Мощьность модуля Пелтье, % от макс
        </RangeInput>
      {:else}
        <RangeInput on:change={changeCurrent}>Установка тока, А</RangeInput>
      {/if}
      <h3>Результаты измерений</h3>
      <div class="result">
        <span class="label">U</span>
        ,
        <em class="units">B</em>
        <strong class="value">{0}</strong>
      </div>
      <div class="result">
        <span class="label">I</span>
        ,
        <em class="units">A</em>
        <strong class="value">{0}</strong>
      </div>
      <div class="result">
        <span class="label">U</span>
        ,
        <em class="units">{'\u2103'}</em>
        <strong class="value">{0}</strong>
      </div>
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
