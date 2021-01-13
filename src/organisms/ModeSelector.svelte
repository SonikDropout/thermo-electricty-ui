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
  import { __ } from '../utils/translations';

  const modeOptions = [
    {
      label: 'constant power',
      value: 0,
      inputLabel: 'power setting',
    },
    {
      label: 'constant temperature',
      value: 1,
      inputLabel: 'temperature setting',
    },
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
  <span class="label">{$__('operating mode')}</span>
{/if}
<Select
  {order}
  {disabled}
  onChange={scwitchMode}
  defaultValue={selectedMode}
  options={modeOptions} />

{#if labeled}
  <span class="label" class:tall={selectedMode}>
    {$__(modeOptions[selectedMode].inputLabel)}
  </span>
{/if}
<RangeInput
  defaultValue={variableParam}
  onChange={changeVariableParam}
  {disabled}
  range={PELTIER_CONSTRAINTS[MODES[selectedMode] + name]} />
