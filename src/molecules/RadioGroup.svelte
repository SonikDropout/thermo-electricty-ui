<script>
  import { __ } from '../utils/translations';
  export let group;
  export let value = group.elements[0].value;
  $: checkedIndex = group.elements.findIndex(el => el.value == value);
  $: longestLabel =
    Math.max.apply(
      null,
      group.elements.map(el => el.label.length + (el.icon ? 2 : 0))
    ) + 3.2;
</script>

<div class="radio-group">
  <div
    class="marker"
    style="width: {longestLabel}rem; transform: translateX({checkedIndex * 100}%)
    " />
  {#each group.elements as element}
    <label style="width: {longestLabel}rem">
      <input
        class="hidden"
        type="radio"
        name={group.name}
        on:change
        bind:group={value}
        value={element.value}
        disabled={element.disabled} />
      <span class="label">
        {#if element.icon}
          <img
            src="../static/icons/{element.icon}.svg"
            alt={element.icon}
            class="icon" />
        {/if}
        {$__(element.label)}
      </span>
    </label>
  {/each}
</div>

<style>
  .radio-group {
    display: flex;
    position: relative;
  }
  .marker {
    position: absolute;
    height: 100%;
    border-radius: 1.6rem;
    background-color: var(--corporate-blue);
    transition: 0.3s;
  }
  input:checked + .label {
    filter: invert(100%);
    color: black;
  }
  .label {
    position: relative;
    display: block;
    height: 3.2rem;
    line-height: 3.2rem;
    padding: 0 1.6rem;
    text-align: center;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 1.6rem;
  }
  .icon {
    height: 1.6rem;
    vertical-align: middle;
  }
</style>
