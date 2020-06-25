<script>
  import PlateColumn from '../organisms/PlateColumn';
  import Button from '../atoms/Button';
  import { slide } from '../transitions';
  export let goBack;
  export let goForward;

  const slideTop = slide('top');
  const slideBottom = slide('bottom');

  const plateColumns = [
    { title: 'Нагревающая пластина', name: 'Hot', pos: 'right' },
    { title: 'Охлаждающая пластина', name: 'Cool', pos: 'left' },
  ];
</script>

<div class="layout">
  <header transition:slideTop>Измерение и контроль температуры</header>
  <main>
    {#each plateColumns as column}
      <PlateColumn {...column} />
    {/each}
  </main>
  <footer transition:slideBottom>
    <Button on:click={goBack}>Назад</Button>
    <Button on:click={goForward}>Постоение графиков</Button>
  </footer>
</div>

<style>
  main {
    display: flex;
    justify-content: space-evenly;
  }
  main :global(div) {
    flex-grow: 1;
  }
  footer {
    padding: var(--gutter-width) 6.4rem;
  }
</style>
