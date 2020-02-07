<script>
  import uuid from "uuid";
  export let name;
  export let disabled;
  export let value;
  const id = uuid();
</script>

<style>
  label {
    color: var(--bg-color);
    background-color: var(--corporate-blue);
    opacity: 0.6;
    transition: 0.3s ease;
  }
  input:checked + label {
    opacity: 1;
    transform: scale(1.1);
  }
</style>

<input class="hidden" {id} type="radio" {name} {disabled} {value} on:change />
<label for={id}>
  <span>
    <slot />
  </span>
</label>
