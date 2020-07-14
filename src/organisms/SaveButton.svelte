<script>
  import Button from '../atoms/Button';
  export let disabled;
  import { ipcRenderer } from 'electron';
  import { fly } from 'svelte/transition';

  let isSaving,
    isSaveFailed,
    saveMessage,
    isActive = ipcRenderer.sendSync('usbStatusRequest');

  ipcRenderer
    .on('usbConnected', () => (isActive = true))
    .on('usbDisconnected', () => {
      isActive = false;
      saveMessage = '';
    });

  function handleClick() {
    disabled = true;
    isSaving = true;
    ipcRenderer.send('saveFile');
    ipcRenderer.on('fileSaved', handleSaved);
  }
  function handleSaved(e, err) {
    if (err) {
      saveMessage = 'Не удалось сохранить файл';
      isSaveFailed = true;
    } else {
      saveMessage = 'Файл успешно сохранен';
    }
    disabled = false;
    isSaving = false;
  }
  function closePopup() {
    saveMessage = void 0;
    isSaveFailed = false;
  }
  function ejectUSB() {
    ipcRenderer.send('ejectUSB', closePopup);
  }
</script>

<Button
  style="width:39rem"
  on:click={handleClick}
  disabled={disabled || !isActive}>
  {#if isSaving}
    <span class="spinner" />
    Идет сохранение
  {:else}Сохранить данные{/if}
  на usb-устройство
</Button>
{#if saveMessage}
  <div class="popup" transition:fly={{ y: -200 }}>
    <span on:click={closePopup} class="popup-close">x</span>
    <p>{saveMessage}</p>
    <Button on:click={ejectUSB} size="sm">извлечь</Button>
  </div>
{/if}

<style>
  .spinner {
    display: inline-block;
    width: 1.8rem;
    height: 1.8rem;
    border: 2px solid var(--bg-color);
    clip-path: polygon(0 0, 50% 0, 50% 50%, 100% 50%, 100% 100%, 0 100%);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .popup {
    position: fixed;
    top: 1rem;
    left: calc(50% - 15rem);
    width: 30rem;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 1.6rem;
    z-index: 9001;
    background-color: var(--bg-color);
    text-align: left;
  }
  .popup-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    color: var(--coporate-grey-darken);
  }
</style>
