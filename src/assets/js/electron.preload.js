/**
 * when browser's window nodeIntegration equals false
 * this restores node globals
 */

const _setImmediate = setImmediate;
const _clearImmediate = clearImmediate;

process.once('loaded', () => {
  global.setImmediate = _setImmediate;
  global.clearImmediate = _clearImmediate;

  /**
   * Dev tools toggle hotkey: SHIFT+CTRL+i
   */
  document.addEventListener('keydown', keydownEvent => {
    const eventObj = window.event ? event : keydownEvent;
    keydownEvent.preventDefault();
    if (eventObj.shiftKey && eventObj.ctrlKey && eventObj.keyCode === 73) {
      // Shift + Ctrl + i
      require('remote').getCurrentWindow().toggleDevTools();
    }
  });
});
