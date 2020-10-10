export function getWindow() {
  return window;
}

export function getNavigator() {
  return typeof window.navigator !== 'undefined' ? window.navigator : void 0;
}
