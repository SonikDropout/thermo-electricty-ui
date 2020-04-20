<script>
  import SelectMode from "./layouts/SelectMode";
  import TempMeasure from "./layouts/TempMeasure";
  import Charts from "./layouts/Charts";
  import { STATES } from "./constants";
  import EffectsResearch from "./layouts/EffectsResearch";
  import OverheatWarning from "./organisms/OverheatWarning";
  let state = STATES.initial;
  const setState = newState => () => (state = newState);
  const changeState = e => {
    state = e.target.value;
  };
</script>

<style>
  div {
    transition: 0.3s ease-in-out;
  }
  .charts {
    transform: translateY(-100vh);
  }
</style>

<OverheatWarning />
<div class={state}>
  {#if state == STATES.initial}
    <SelectMode on:change={changeState} />
  {:else if state == STATES.effects}
    <EffectsResearch goBack={setState(STATES.initial)} />
  {:else}
    <TempMeasure
      goBack={setState(STATES.initial)}
      goForward={setState(STATES.charts)} />
    <Charts goBack={setState(STATES.temp)} />
  {/if}
</div>
