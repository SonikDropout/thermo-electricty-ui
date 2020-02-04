<script>
  export let max = 100;
  export let min = 0;
  export let value = 0;

  let input,
    showControls = false;

  function increment() {
    if (input) input.value += 1;
  }

  function decrement() {
    if (input) input.value -= 1;
  }

  function slideTransition(direction) {
    return function(node, { duration }) {
      const o = +getComputedStyle(node).opacity;
      return {
        duration,
        css: t =>
          `transform: translate(0, ${(direction == "top" ? -t : t) *
            100}%); opacity: ${Math.abas(o - t)}`
      };
    };
  }

  const slideTop = slideTransition("top");
  const slideBottom = slideTransition("bottom");
</script>

<style>
  label {
    display: block;
  }
  input {
    width: 5rem;
    border-radius: 4px;
    border-color: var(--corporate-blue-darken);
  }
  .arrow {
    position: absolute;
    background-color: transparent;
    border: none;
  }
</style>

<label>
  <span>
    <slot />
  </span>
  <input
    type="number"
    bind:this={input}
    {value}
    {min}
    {max}
    on:change
    on:focus={() => (showControls = true)}
    on:blur={() => (showControls = false)} />
  {#if showControls}
    <button class="arrow icon-arrow-up" transition:slideTop on:click={increment} />
    <button
      class="arrow icon-arrow-down"
      transition:slideBottom
      on:click={decrement} />
  {/if}
</label>
