<script>
  export let name;
  export let order;
  export let disabled;
  export let labeled;
  import { data, getStoreValue } from '../stores';
  import { ipcRenderer } from 'electron';
  import { COMMANDS, MODES, PELTIER_CONSTRAINTS } from '../constants';
  import Select from '../molecules/Select';
  import RangeInput from '../molecules/RangeInput';

  const modeOptions = [
    {
      label: 'по мощности',
      value: 0,
      inputLabel: 'Задание Мощности,<br/> % от макс',
    },
    { label: 'по температуре', value: 1, inputLabel: 'Задание T, \u02daC' },
  ];

  let selectedMode = $data['mode' + name].value;
  $: variableParam = getStoreValue(data)[
    (selectedMode ? 'setTemperature' : 'load') + name
  ].value;

  function scwitchMode(mode) {
    selectedMode = +mode;
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

{#if labeled}
  <span class="label">Режим работы</span>
{/if}
<Select
  {order}
  {disabled}
  onChange={scwitchMode}
  defaultValue={selectedMode}
  options={modeOptions} />

{#if labeled}
  <span class="label" class:tall={selectedMode}>
    {@html modeOptions[selectedMode].inputLabel}
  </span>
{/if}
<RangeInput
  defaultValue={variableParam}
  onChange={changeVariableParam}
  {disabled}
  range={PELTIER_CONSTRAINTS[MODES[selectedMode] + name]} />
