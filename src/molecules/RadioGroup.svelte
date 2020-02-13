<script>
  export let group;
  export let type;
  export let value;
</script>

<style>
  .radio-group.horizontal {
    display: flex;
    border-radius: 4px;
    overflow: hidden;
  }
  input:checked + span {
    box-shadow: inset 0 0 2px 2px var(--text-color);
    background-color: var(--corporate-blue-darken);
  }
  span {
    display: block;
    padding: 4px 10px;
    color: var(--bg-color);
    font-weight: 500;
    background-color: var(--corporate-blue);
  }
</style>

<div class="radio-group {type}">
  {#each group.elements as element}
    <label>
      <input
        class="hidden"
        type="radio"
        name={group.name}
        bind:group={value}
        value={element.value}
        disabled={element.disabled} />
      <span>{@html element.label}</span>
    </label>
  {/each}
</div>
