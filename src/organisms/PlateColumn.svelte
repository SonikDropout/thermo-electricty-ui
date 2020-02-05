<script>
  import Toggle from "../atoms/Toggle";
  import Select from "../atoms/Select";
  import RangeInput from "../molecules/RangeInput";
  import Value from "../atoms/Value";

  let plateOn = false;
</script>

<style>
  div {
    padding: var(--gutter-width);
  }
  h2 {
    text-align: center;
  }
  h2, h3 {
    margin: 1.6rem 0;
  }
</style>

<div>
  <h2>Охлаждающая пластина</h2>
  <Toggle on:change={(e) => plateOn = e.target.checked}>Состояние</Toggle>
  <Value value={0}>Температура</Value>
  <Select options={[{label: 'по температуре', value: 'temp'}, {label: 'по мощности', value: 'power'}]}>Режим работы</Select>
  <RangeInput>Задание T, {'\u2103'}</RangeInput>
  <h3>Характеристики</h3>
  <Value value={0}>U, В</Value>
  <Value value={0}>I, A</Value>
  <h3>Результаты измерений</h3>
  <Value fullWidth value={0}>Терморезистор, Ом</Value>
  <Value fullWidth value={0}>Термопара, В</Value>
  <Value fullWidth value={0}>Термистор, кОм</Value>
</div>
