<script>
  import PlateColumn from "../organisms/PlateColumn";
  import Button from "../atoms/Button";
  import { slide } from "../transitions";
  export let goBack;
  export let goForward;

  const slideTop = slide("top");
  const slideBottom = slide("bottom");

  const plateColumns = [
    { title: "Охлаждающая пластина", name: "Cool", pos: "left" },
    { title: "Нагревающая пластина", name: "Hot", pos: "right" }
  ];
</script>

<style>
  main {
    display: flex;
    justify-content: space-evenly;
  }
  main :global(div) {
    flex-grow: 1;
  }
  footer {
    padding: var(--gutter-width) 7.5rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  footer :global(button:last-of-type) {
    margin: auto;
  }
</style>

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
