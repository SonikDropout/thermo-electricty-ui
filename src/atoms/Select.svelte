<script>
  export let selected = {label: '-- не выбран --'};
  export let onChange;
  export let options;

  let showOptions = false;

  function drop(node, { duration }) {
		return {
			duration,
			css: t => `transform: scaleY(${t})`
		};
	}
</script>

<style>
  .select-box {
    position: relative;
    height: 4rem;
  }

  .select {
    position: absolute;
    top: 0;
    left: 0;
    border: 1px solid var(--corporate-blue-darken);
    border-radius: 4px;
  }

  span {
    display: block;
  }

  span, li {
    padding: 0 2rem;
    line-height: 4rem;
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
  <div class="select">
    <span>{selected.label}</span>
    {#if showOptions}
      <ul transition:drop>
        {#each options as { icon, label, value }}
          <li data-value={value} on:click={onChange}>
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
