<script>
  export let range = [0, 100];
  export let value = range[0];

  let step = 1;

  $: diff = range[1] - range[0];

  $: {
    if (diff < 1) step = 0.01;
    if (diff < 10) step = 0.1;
  }

  let input,
    timeout,
    interval,
    container,
    showControls = false;

  function increment() {
    if (input) input.stepUp();
  }

  function decrement() {
    if (input) input.stepDown();
  }

  function stickyCall(fn) {
    fn();
    timeout = setTimeout(() => {
      fn();
      interval = setInterval(fn, 50);
    }, 500);
  }

  function pressIncrement() {
    stickyCall(increment);
  }

  function pressDecrement() {
    stickyCall(decrement);
  }

  function release() {
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
  }
</script>

<style>
  label {
    display: flex;
    align-items: center;
  }
  .input-wrapper {
    width: 16rem;
    border-radius: 4px;
    border: 1px solid var(--corporate-blue-darken);
    height: 3.2rem;
    line-height: 3.2rem;
    display: flex;
  }
  input {
    flex-grow: 1;
    padding: 0 1rem;
    border: none;
    font-size: 2rem;
    text-align: center;
    border-left: 1px solid;
    border-right: 1px solid;
    border-color: var(--corporate-blue-darken);
  }
  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  button {
    border: none;
    background-color: transparent;
    width: 4rem;
    font-size: 3.2rem;
    line-height: 0.8;
    font-weight: 300;
  }
</style>

<label bind:this={container}>
  <span>
    <slot />
  </span>
  <span class="input-wrapper">
    <button
      class="incrementer"
      on:pointerdown={pressDecrement}
      on:pointerup={release}>
      -
    </button>
    <input type="number" bind:this={input} {value} min={range[0]} max={range[1]} on:change {step} />
    <button
      class="decrementer"
      on:pointerdown={pressIncrement}
      on:pointerup={release}>
      +
    </button>
  </span>
</label>
