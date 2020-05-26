<script>
  import { slide } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  export let onChange;
  export let options;
  export let disabled;
  export let defaultValue;
  export let order;
  export let style;

  onMount(() => document.addEventListener('click', handleClickOutside));
  onDestroy(() => document.removeEventListener('click', handleClickOutside));

  let select;

  function handleClickOutside(e) {
    if (optionsVisible && !select.contains(e.target)) optionsVisible = false;
  }

  let selected = options.find(o => o.value === defaultValue) || {
    label: '-- не выбран --',
  };

  let optionsVisible = false;
  const h = 100 * options.length;

  $: active = selected.value !== void 0;

  function toggleOptions() {
    if (disabled) return;
    optionsVisible = !optionsVisible;
  }

  function selectOption(e) {
    optionsVisible = false;
    const v = e.target.dataset.value;
    selected = options.find(o => o.value == v);
    onChange(v);
  }
</script>

<div class="select-wrapper">
  <div
    class="select"
    bind:this={select}
    class:disabled
    class:active
    class:expand={optionsVisible}>
    <div class="curr-value" on:click={toggleOptions}>{selected.label}</div>
    {#if optionsVisible}
      <ul transition:slide>
        {#each options as { icon, label, value }}
          <li data-value={value} on:click={selectOption}>
            {#if icon}
              <i class="icon icon-{icon}" />
            {/if}
            {label}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .select-wrapper {
    position: relative;
    height: 3.2rem;
    line-height: 3.2rem;
    min-width: 16rem;
  }

  .select {
    width: 100%;
    position: absolute;
    top: 0;
    right: 0;
    border: 1px solid var(--corporate-blue-darken);
    border-radius: 4px;
    background-color: var(--bg-color);
    z-index: 9999;
  }

  .select.disabled {
    opacity: 0.8;
  }
  .select.active {
    background-color: var(--corporate-blue);
    color: var(--bg-color);
  }

  .curr-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .curr-value::after {
    content: '';
    display: block;
    border: 5px solid transparent;
    position: relative;
    top: 3px;
    border-top-color: var(--corporate-blue);
    transition: 0.3s ease;
  }
  .select.active .curr-value::after {
    border-top-color: var(--corporate-blue-darken);
  }
  .select.expand .curr-value::after {
    transform: rotate(180deg) translateY(5px);
  }

  .curr-value,
  li {
    padding: 0 0.8rem;
    line-height: 3.2rem;
    cursor: pointer;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    padding: 0 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
