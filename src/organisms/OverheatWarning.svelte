<script>
  import { data } from "../stores";
  import { CRITICAL_TEMP } from "../constants";
  $: isOverheat = $data.temperatureHot.value > CRITICAL_TEMP;
</script>

<style>
  .warning {
    position: fixed;
    top: 2rem;
    display: flex;
    max-width: 20rem;
  }
  img {
    animation: blink 1s linear infinite alternate;
    width: 5rem;
  }
  span {
    color: var(--danger-color);
  }
</style>

{#if isOverheat}
  <div class="warning">
    <img src="../../static/icons/warning.svg" alt="warning" />
    <span>Перегрев модуля Пельте!</span>
  </div>
{/if}
