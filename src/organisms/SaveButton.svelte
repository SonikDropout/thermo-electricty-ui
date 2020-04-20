<script>
  import Button from "../atoms/Button";
  export let onSave;
  export let disabled;
  import { ipcRenderer } from "electron";
  import { fly } from "svelte/transition";
  let isSaving, isSaveFailed, saveMessage;
  function handleClick() {
    disabled = true;
    isSaving = true;
    onSave();
    ipcRenderer.on("fileSaved", handleSaved);
  }
  function handleSaved(e, err) {
    if (err) {
      saveMessage = "Не удалось сохранить файл";
      isSaveFailed = true;
    } else {
      saveMessage = "Файл успешно сохранен";
    }
    disabled = false;
    isSaving = false;
  }
  function closePopup() {
    saveMessage = void 0;
    isSaveFailed = false;
  }
  function ejectUSB() {
    ipcRenderer.send("ejectUSB", closePopup);
  }
</script>

<style>
  .spinner {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--bg-color);
    clip-path: polygon(0 0, 50% 0, 50% 50%, 100% 50%, 100% 100%, 0 100%);
    animation: spin 1s linear infinite;
  }
  .popup {
    position: fixed;
    top: 1rem;
    left: calc(50% - 15rem);
    width: 30rem;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 2.4rem;
  }
  .popup-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    color: var(--coporate-grey-darken);
  }
</style>

<Button on:click={handleClick} {disabled}>
  {#if isSaving}
    <span class="spinner" />
  {/if}
  Сохранить данные на usb-устройство
</Button>
{#if saveMessage}
  <div class="popup" transition:fly={{ y: -200 }}>
    <span class="popup-close">x</span>
    <p>{saveMessage}</p>
    <Button on:click={ejectUSB} size="sm">извлечь</Button>
  </div>
{/if}
