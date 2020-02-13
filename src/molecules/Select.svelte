<script>
  export let selected = { label: "-- не выбран --" };
  export let onChange;
  export let options;
  export let disabled;

  let optionsVisible = false;

  function toggleOptions() {
    if (disabled) return;
    optionsVisible = !optionsVisible;
  }

  function drop(node, { duration }) {
    return {
      duration,
      css: t => `max-height: ${t * 100}vh`
    };
  }

  function selectOption(e) {
    optionsVisible = false;
    onChange(e);
  }
</script>

<style>
  .select-box {
    height: 3.2rem;
    line-height: 3.2rem;
    width: 100%;
    display: flex;
  }

  .select-wrapper {
    flex-grow: 1;
    position: relative;
  }

  .select {
    width: 100%;
    position: absolute;
    top: 0;
    right: 0;
    border: 1px solid var(--corporate-blue-darken);
    border-radius: 4px;
    background-color: var(--bg-color);
  }

  .select.disabled {
    opacity: 0.8;
  }

  .curr-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .curr-value::after {
    content: "";
    display: block;
    border: 5px solid transparent;
    border-top-color: var(--corporate-blue);
  }

  .curr-value,
  li {
    padding: 0 2rem;
    line-height: 3.2rem;
    cursor: pointer;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    padding: 0 2rem;
  }
</style>

<div class="select-box">
  <span>
    <slot />
  </span>
  <div class="select-wrapper">
    <div class="select" class:disabled>
      <div class="curr-value" on:click={toggleOptions}>{selected.label}</div>
      {#if optionsVisible}
        <ul transition:drop>
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
</div>
