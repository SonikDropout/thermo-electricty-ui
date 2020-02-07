<script>
  import Toggle from "../atoms/Toggle";
  import Select from "../atoms/Select";
  import RangeInput from "../molecules/RangeInput";
  import Value from "../atoms/Value";
  import { slide } from "../transitions";
  import { data } from "../stores";
  export let pos;
  export let name;
  export let title;

  console.log($data);

  const slideCol = slide(pos);

  let plateOn = false;
</script>

<style>
  div {
    padding: var(--gutter-width);
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  div {
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
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
  }
</style>

<div class="{name}" style="background-image:url(./icons/{name.toLowerCase()}.svg" transition:slideCol>
  <h2>{title}</h2>
  <span class="label">Состояние</span>
  <Toggle on:change={e => (plateOn = e.target.checked)} />
  <span class="label">Температура</span>
  <Value value={0} />
  <span class="label">Режим работы</span>
  <Select
    options={[{ label: 'по температуре', value: 'temp' }, { label: 'по мощности', value: 'power' }]} />
  <span class="label">Задание T, {'\u2103'}</span>
  <RangeInput />
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
