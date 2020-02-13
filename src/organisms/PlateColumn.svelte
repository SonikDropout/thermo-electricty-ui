<script>
  import Toggle from "../atoms/Toggle";
  import Select from "../molecules/select";
  import RangeInput from "../molecules/RangeInput";
  import Value from "../atoms/Value";
  import { slide } from "../transitions";
  import { data } from "../stores";
  import {
    INTERGRATED_PELTIER_PARAMS,
    COMMANDS,
    PELTIER_CONSTRAINTS
  } from "../constants";
  import { ipcRenderer } from "electron";
  export let pos;
  export let name;
  export let title;

  console.log($data);

  const slideCol = slide(pos);

  let isActive = !!$data[`state${name}`].value;
  let mode = 'Temp';

  const modeOptions = [
    { label: "по температуре", value: "Temp", inputLabel: "Задание T, \u2103" },
    {
      label: "по мощности",
      value: "Power",
      inputLabel: "Задание Мощности, % от макс"
    }
  ];

  function togglePeltier(e) {
    const { name, checked } = e.target;
    ipcRenderer.send(
      "serialCommand",
      COMMANDS[`turn${checked ? "On" : "Off"}${name}Peltier`]
    );
    isActive = checked;
  }

  function switchPeltierMode(e) {
    const newMode = e.target.dataset.value;
    ipcRenderer.send(
      "serialCommand",
      COMMANDS[`constanst${newMode}${name}Peltier`]
    );
    mode = newMode;
  }

  function changeVariableParam(e) {
    ipcRenderer.send(
      "serialCommand",
      ...COMMANDS[`set${mode}${name}Peltier`](e.target.value)
    );
  }
</script>

<style>
  div {
    max-width: 40rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    align-items: center;
  }
  div > * {
    grid-column-start: 2;
  }
  .label {
    grid-column-start: 1;
  }
  h2,
  h3 {
    text-align: center;
    grid-column: span 2;
    margin: 1.6rem 0;
  }
  h2 {
    margin-top: 0;
    font-size: 2.4rem;
  }
  h3 {
    font-size: 2rem;
  }
</style>

<div
  class={name}
  style="background-image:url(./icons/{name.toLowerCase()}.svg"
  transition:slideCol>
  <h2>{title}</h2>
  <span class="label">Состояние</span>
  <Toggle on:change={togglePeltier} checked={isActive} />
  <span class="label">Температура</span>
  <strong class="value">{$data['temperature' + name].value}</strong>
  <span class="label">Режим работы</span>
  <Select
    onChange={switchPeltierMode}
    disabled={isActive}
    selected={modeOptions[0]}
    options={modeOptions} />
  <span class="label">{modeOptions[Number(mode === 'Power')].inputLabel}</span>
  <RangeInput
    on:change={changeVariableParam}
    disabled={isActive}
    range={PELTIER_CONSTRAINTS[mode + name]} />
  <h3>Характеристики</h3>
  {#each ['voltage', 'current'] as param}
    <span class="label">
      {$data[param + name].label}, {$data[param + name].units}
    </span>
    <strong class="value">{$data[param + name].value || 0}</strong>
  {/each}
  <h3>Результаты измерений</h3>
  {#each ['thermistor', 'thermocouple', 'thermoresistor'] as sensor}
    <span class="label">
      {$data[sensor + name].label}, {$data[sensor + name].units}
    </span>
    <strong class="value">{$data[sensor + name].value || 0}</strong>
  {/each}
</div>
