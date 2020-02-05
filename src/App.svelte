<script>
  import SelectMode from "./layouts/SelectMode.svelte";
  import TempMeasure from "./layouts/TempMeasure.svelte";
  import Charts from "./layouts/Charts.svelte";
  import { TEMP_MEASURE, EFFECTS_RESEARCH, CHARTS, INITIAL } from "./constants";
  import EffectsResearch from "./layouts/EffectsResearch.svelte";
  let state = INITIAL;
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

<div class={state}>
  {#if state == INITIAL}
    <SelectMode on:change={changeState} />
  {:else if state == EFFECTS_RESEARCH}
    <EffectsResearch goBack={setState(INITIAL)} />
  {:else}
    <TempMeasure goBack={setState(INITIAL)} goForward={setState(CHARTS)} />
    <Charts goBack={setState(TEMP_MEASURE)} />
  {/if}
</div>
