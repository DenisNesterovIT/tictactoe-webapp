export function getTG() {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp
  }
  // Fallback stub for local development outside Telegram
  return {
    initDataUnsafe: {},
    colorScheme: 'light',
    themeParams: {},
    ready: () => console.log('[TG] ready() (stub)'),
    expand: () => console.log('[TG] expand() (stub)'),
    close: () => console.log('[TG] close() (stub)'),
    sendData: (d) => console.log('[TG] sendData:', d),
    HapticFeedback: {
      impactOccurred: () => {},
      notificationOccurred: () => {},
      selectionChanged: () => {}
    },
    MainButton: {
      text: '',
      isVisible: false,
      show: () => console.log('[TG] MainButton.show (stub)'),
      hide: () => console.log('[TG] MainButton.hide (stub)'),
      setText: (t) => console.log('[TG] MainButton.setText', t),
      onClick: () => {},
      offClick: () => {}
    }
  }
}
