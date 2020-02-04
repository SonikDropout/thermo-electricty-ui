<script>
  import SelectMode from "./layouts/SelectMode.svelte";
  import TempMeasure from "./layouts/TempMeasure.svelte";
  import Charts from "./layouts/Charts.svelte";
  import { TEMP_MEASURE, EFFECTS_RESEARCH, CHARTS, INITIAL } from "./constants";
  import EffectsResearch from "./layouts/EffectsResearch.svelte";
  let state;
</script>

<style>
  div {
    transition: 0.3s ease-in-out;
  }
  .charts {
    transform: translateY(-200vh);
  }
  .effects,
  .temp {
    transform: translateY(-100vh);
  }
</style>

<div class={state}>
  <SelectMode setMode={mode => (state = mode)} />
  {#if state == TEMP_MEASURE}
    <TempMeasure
      goBack={() => (state = INITIAL)}
      goForward={() => (state = CHARTS)} />
    <Charts goBack={() => (state = TEMP_MEASURE)} />
  {:else if state == EFFECTS_RESEARCH}
    <EffectsResearch goBack={() => (state = INITIAL)} />
  {/if}
</div>
