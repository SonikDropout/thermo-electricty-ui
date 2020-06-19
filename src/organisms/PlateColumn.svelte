<script>
  import Toggle from '../atoms/Toggle';
  import Select from '../molecules/Select';
  import ModeSelector from './ModeSelector';
  import RangeInput from '../molecules/RangeInput';
  import Value from '../atoms/Value';
  import { data, getStoreValue } from '../stores';
  import {
    INTERGRATED_PELTIER_PARAMS,
    COMMANDS,
    PELTIER_CONSTRAINTS,
    MODES,
  } from '../constants';
  import { debounce } from '../utils/others';
  import { ipcRenderer } from 'electron';
  export let name;
  export let title;

  let isActive = $data[`state${name}`].value;

  $: console.log(isActive, name);

  const initialData = $data;

  const debouncedToggleReset = debounce(d => {
    if (d['state' + name].value != isActive) {
      isActive = d['state' + name].value;
    }
  }, 1000);

  data.subscribe(debouncedToggleReset);

  function togglePeltier(e) {
    const { checked } = e.target;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[`turn${checked ? 'On' : 'Off'}${name}Peltier`]
    );
    isActive = checked;
  }
</script>

<div
  class={name}
  style="background-image:url(./icons/bg-{name.toLowerCase()}.svg">
  <h2>{title}</h2>
  <span class="label">Состояние</span>
  <Toggle on:change={togglePeltier} checked={isActive} />
  <span class="label">Температура</span>
  <strong class="value">{$data['temperature' + name].value.toFixed(1)}</strong>
  <ModeSelector disabled={!isActive} {name} labeled={true} />
  <h3>Характеристики</h3>
  {#each ['voltage', 'current'] as param}
    <span class="label">
      {$data[param + name].label}, {$data[param + name].units}
    </span>
    <strong class="value">
      {$data[param + name].value.toFixed(+initialData[
          param + name
        ].divider
          .toExponential()
          .split('e')[1])}
    </strong>
  {/each}
  <h3>Результаты измерений</h3>
  {#each ['thermoresistor', 'thermocouple', 'thermistor'] as sensor}
    <span class="label">
      {$data[sensor + name].label}, {$data[sensor + name].units}
    </span>
    <strong class="value">
      {$data[sensor + name].value.toFixed(+initialData[
          sensor + name
        ].divider
          .toExponential()
          .split('e')[1])}
    </strong>
  {/each}
</div>

<style>
  div {
    max-width: 41.6rem;
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
    display: inline-block;
    align-self: center;
  }
  .label.tall {
    height: 3.8rem;
    line-height: 3.8rem;
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
