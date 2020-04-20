<script>
  import Toggle from '../atoms/Toggle';
  import Select from '../molecules/Select';
  import RangeInput from '../molecules/RangeInput';
  import Value from '../atoms/Value';
  import { slide } from '../transitions';
  import { data } from '../stores';
  import {
    INTERGRATED_PELTIER_PARAMS,
    COMMANDS,
    PELTIER_CONSTRAINTS,
    MODES,
  } from '../constants';
  import { ipcRenderer } from 'electron';
  export let pos;
  export let name;
  export let title;

  const slideCol = slide(pos);

  let isActive;

  data.subscribe(d => {
    isActive = !!d[`state${name}`].value;
    console.log(isActive);
  });

  const modeOptions = [
    {
      label: 'по мощности',
      value: 0,
      inputLabel: 'Задание Мощности, % от макс',
    },
    { label: 'по температуре', value: 1, inputLabel: 'Задание T, \u2103' },
  ];

  let selectedMode = $data[`mode${name}`].value;

  function togglePeltier(e) {
    const { checked } = e.target;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[`turn${checked ? 'On' : 'Off'}${name}Peltier`]
    );
    isActive = checked;
  }

  function switchPeltierMode(mode) {
    selectedMode = mode;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[`constant${MODES[selectedMode]}${name}Peltier`]
    );
  }

  function changeVariableParam(v) {
    ipcRenderer.send(
      'serialCommand',
      ...COMMANDS[`set${MODES[selectedMode]}${name}Peltier`](v)
    );
  }
</script>

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
    disabled={!isActive}
    defaultValue={selectedMode}
    options={modeOptions} />
  <span class="label">{modeOptions[selectedMode].inputLabel}</span>
  <RangeInput
    defaultValue={$data[(selectedMode ? 'setTemperature' : 'load') + name].value}
    onChange={changeVariableParam}
    disabled={!isActive}
    range={PELTIER_CONSTRAINTS[MODES[selectedMode] + name]} />
  <h3>Характеристики</h3>
  {#each ['voltage', 'current'] as param}
    <span class="label">
      {$data[param + name].label}, {$data[param + name].units}
    </span>
    <strong class="value">{$data[param + name].value || 0}</strong>
  {/each}
  <h3>Результаты измерений</h3>
  {#each ['thermoresistor', 'thermocouple', 'thermistor'] as sensor}
    <span class="label">
      {$data[sensor + name].label}, {$data[sensor + name].units}
    </span>
    <strong class="value">{$data[sensor + name].value || 0}</strong>
  {/each}
</div>

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
