<script>
  import { data } from '../stores';
  import { CRITICAL_TEMP } from '../constants';
  $: isOverheat = $data.temperatureHot.value > CRITICAL_TEMP;
</script>

{#if isOverheat}
  <div class="warning">
    <img src="./icons/warning.svg" alt="warning" />
    <span>Перегрев модуля Пельте!</span>
  </div>
{/if}

<style>
  .warning {
    position: fixed;
    top: 2rem;
    right: 2rem;
    display: flex;
    max-width: 20rem;
    align-items: center;
  }
  img {
    animation: blink 1s linear infinite alternate;
    width: 4rem;
    margin-right: 1rem;
  }
  span {
    color: var(--danger-color);
  }
</style>
