<script>
  import uuid from 'uuid';
  import { __ } from '../utils/translations';
  export let checked;
  const id = uuid();
</script>

<input type="checkbox" {id} on:change bind:checked />
<label for={id}>
  <slot />
  <span class:checked>{checked ? $__('on') : $__('off')}</span>
</label>

<style>
  input {
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;
  }
  span {
    display: inline-block;
    width: 5rem;
    background-color: var(--corporate-grey);
    border-radius: 2rem;
    height: 2rem;
    position: relative;
    color: var(--bg-color);
    text-align: right;
    font-size: 1rem;
    line-height: 2rem;
    padding: 0 0.4rem;
  }
  span.checked {
    text-align: left;
  }
  span::after {
    position: absolute;
    top: 2px;
    left: 2px;
    content: '';
    border-radius: 50%;
    height: calc(2rem - 4px);
    width: calc(2rem - 4px);
    background-color: var(--bg-color);
    transition: 0.2s ease;
  }
  input:checked + label > span {
    background-color: var(--corporate-blue);
  }
  input:checked + label > span::after {
    transform: translateX(3rem);
  }
</style>
