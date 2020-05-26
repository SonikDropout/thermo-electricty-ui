<script>
  export let className;
  export let disabled;
  export let name;
  export let style;
</script>

<style>
  button {
    background-color: var(--corporate-grey);
    color: var(--bg-color);
    border: none;
    border-radius: 0.4rem;
    padding: 1.2rem 1.6rem;
    white-space: nowrap;
    font-size: 2rem;
    box-shadow: 0 3px 0 var(--corporate-grey-darken);
  }

  button:disabled {
    opacity: 0.8;
  }

  button:active {
    box-shadow: 0 2px 0 var(--corporate-grey-darken);
    transform: translateY(1px);
    outline: none;
  }

  button:focus {
    outline: none;
  }

  button :global(.icon) {
    font-size: 1.8rem;
  }
</style>

<button {disabled} {style} class={className} {name} on:click>
  <slot />
</button>
