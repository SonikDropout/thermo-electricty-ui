<script>
  import { TEMP_MEASURE, EFFECTS_RESEARCH } from "../constants";
  function unite(direction) {
    return function(node, { duration = 300 }) {
      return {
        duration,
        css: t => {
          const shift = Math.abs(1 - t) * 100 * (direction == "right" ? 1 : -1);
          return `transform: translate(${shift}%, ${shift}%)`;
        }
      };
    };
  }
  const uniteLeft = unite("left");
  const uniteRight = unite("right");
</script>

<style>
  main {
    width: 100vw;
    height: 100vh;
    display: flex;
  }
  div.area {
    flex-grow: 1;
    display: flex;
    transform: scale(1.3);
  }
  div.temp {
    background-color: var(--corporate-orange);
    clip-path: polygon(0 0, 0 100%, 80% 100%, 80% 60%, 100% 40%, 100% 0);
  }
  div.effects {
    background-color: var(--corporate-blue);
    clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 60%, 20% 40%, 20% 0);
  }
  .temp label {
    margin: 30% auto;
  }
  .effects label {
    margin: auto auto 30% auto;
  }
  input {
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;
  }
  label {
    font-size: 3.2rem;
    font-weight: bold;
    color: var(--bg-color);
    max-width: 50%;
  }
  label:hover {
    text-shadow: 2px 2px var(--corporate-grey);
  }
</style>

<main>
  <div class="area temp" transition:uniteLeft>
    <label>
      Измерение и контроль температуры
      <input type="radio" name="appState" value={TEMP_MEASURE} on:change />
    </label>
  </div>
  <div class="area effects" transition:uniteRight>
    <label>
      Измерение эффектов Пельтье и Зеебека
      <input type="radio" name="appState" value={EFFECTS_RESEARCH} on:change />
    </label>
  </div>
</main>
