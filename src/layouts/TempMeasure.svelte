<script>
  import PlateColumn from '../organisms/PlateColumn';
  import Button from '../atoms/Button';
  export let goBack;
  export let goForward;

  const plateColumns = [{title: 'heating'}, {title: 'cooling'}]
</script>

<style>
  main {
    display: flex;
    justify-content: stretch;
  }
  main :global(div)  {
    flex-grow: 1;
  }
  footer {
    padding: var(--gutter-width);
    display: flex;
    align-items: center;
  }
  footer :global(button:first-child) {
    margin: auto;
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
    <Button on:click={goForward}>Постоение графиков</Button>
    <Button on:click={goBack}>Назад</Button>
  </footer>
</div>
