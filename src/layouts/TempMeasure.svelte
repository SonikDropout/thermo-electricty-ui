<script>
  import PlateColumn from '../organisms/PlateColumn';
  import Button from '../atoms/Button';
  import { slide } from '../transitions';
  import { __ } from '../utils/translations';
  export let goBack;
  export let goForward;

  const slideTop = slide('top');
  const slideBottom = slide('bottom');

  const plateColumns = [
    { title: 'heating plate', name: 'Hot', pos: 'right' },
    { title: 'cooling plate', name: 'Cool', pos: 'left' },
  ];
</script>

<div class="layout">
  <header transition:slideTop>{$__('temperature measurement and control')}</header>
  <main>
    {#each plateColumns as column}
      <PlateColumn {...column} />
    {/each}
  </main>
  <footer transition:slideBottom>
    <Button on:click={goBack}>{$__('back')}</Button>
    <Button on:click={goForward}>{$__('charts')}</Button>
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
