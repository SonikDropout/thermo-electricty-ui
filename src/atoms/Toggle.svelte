<script>
  import uuid from 'uuid';
  const id = uuid();
</script>

<style>
  input {
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;
  }
  span {
    display: inline-block;
    width: 4rem;
    background-color: var(--corporate-grey);
    border-radius: 2rem;
    height: 2rem;
    position: relative;
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
    transition: .2s ease;
  }
  input:checked + label>span {
    background-color: var(--corporate-blue);
  }
  input:checked + label>span::after {
    transform: translateX(2rem);
  }
</style>

<input type="checkbox" id="{id}" on:change>
<label for="{id}"><slot></slot> <span></span></label>