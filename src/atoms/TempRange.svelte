<script>
  export let min;
  export let max;
  export let value;
  export let onChange;

  $: percent = (value - min) / (max - min);

  function capturePointer(e) {
    e.target.setPointerCapture(e.pointerId);
  }

  function movePointer(e) {
    // pass
  }

  function releasePointer(e) {
    // pass
  }
</script>

<style>
  .bar {
    height: 10rem;
    width: 1rem;
  }

  .bar::after {
    content: '';
    background-color: var(--corporate-blue);
    border-radius: 50%;
    display: block;
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--text-color);
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
  }
</style>


<div class="bar">
  <div class="bar-slider" on:pointerdown={capturePointer} on:pointermove={movePointer} on:pointerup={releasePointer}></div>
  <div class="bar-inner" stlye="clip-path: 0 100%, 100% 100%, 100% {100 - percent}%, 0 {100 - percent}%"></div>
</div>