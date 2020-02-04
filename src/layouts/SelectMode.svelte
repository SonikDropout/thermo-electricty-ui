<script>
  import {TEMP_MEASURE, EFFECTS_RESEARCH} from '../constants';
  export let setMode;
</script>

<style>
  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    padding: var(--gutter-width);
  }
  div {
    display: flex;
    text-align: center;
    align-items: center;
    border-radius: 4px;
    border-width: 2px;
    border-style: solid;
    font-size: 4rem;
  }
  div:first-child {
    margin-right: var(--gutter-width);
  }
  div.temp {
    border-color: var(--corporate-orange);
  }
  div.effects {
    border-color: var(--corporate-blue);
  }
</style>

<main>
  <div class="temp" on:click={() => setMode(TEMP_MEASURE)}>
    Измерение и контроль температуры
  </div>
  <div class="effects" on:click={() => setMode(EFFECTS_RESEARCH)}>
    Измерение эффектов Пельтье и Зеебека
  </div>
</main>