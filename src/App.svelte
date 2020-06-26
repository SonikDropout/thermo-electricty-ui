<script>
  import SelectMode from './layouts/SelectMode';
  import TempMeasure from './layouts/TempMeasure';
  import Charts from './layouts/Charts';
  import { STATES } from './constants';
  import EffectsResearch from './layouts/EffectsResearch';
  import OverheatWarning from './organisms/OverheatWarning';
  let state = STATES.initial;
  const setState = newState => () => (state = newState);
  const changeState = e => {
    state = e.target.value;
  };
</script>

<OverheatWarning />
<div class="content {state}">
  {#if state == STATES.initial}
    <SelectMode on:change={changeState} />
  {/if}
  <div class="research">
    <EffectsResearch
      goBack={setState(STATES.initial)}
      visible={state == STATES.effects} />
  </div>
  <div class="measures">
    <TempMeasure
      goBack={setState(STATES.initial)}
      goForward={() => window.scrollTo({ top: window.innerHeight })} />
    <Charts goBack={() => window.scrollTo({ top: 0 })} />
  </div>
</div>

<style>
  .content {
    transition: 0.3s ease-in-out;
  }
  .measures,
  .research {
    display: none;
  }
  .temp .measures {
    display: block;
  }
  .effects .research {
    display: block;
  }
</style>
