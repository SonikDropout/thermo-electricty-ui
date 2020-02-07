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
    justify-content: stretch;
  }
  main :global(div) {
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
  <header transition:slideTop>Измерение и контроль температуры</header>
  <main>
    {#each plateColumns as column}
      <PlateColumn {...column} />
    {/each}
  </main>
  <footer transition:slideBottom>
    <Button on:click={goForward}>Постоение графиков</Button>
    <Button on:click={goBack}>Назад</Button>
  </footer>
</div>
