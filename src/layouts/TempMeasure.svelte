<script>
  import PlateColumn from '../organisms/PlateColumn';
  export let goBack;
  export let goForward;

  const plateColumns = [{title: 'heating'}, {title: 'cooling'}]
</script>

<style>
  main {
    display: flex;
  }
</style>

<div class="layout">
  <header>Измерение и контроль температуры</header>
  <main>
    {#each plateColumns as column}
      <PlateColumn {...column} />
    {/each}
  </main>
  <footer>
    <button on:click={goForward}>Постоение графиков</button>
    <button on:click={goBack}>Назад</button>
  </footer>
</div>
