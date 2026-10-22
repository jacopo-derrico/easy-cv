let timer = 0

export function useStatus() {
  const message = useState('easy-cv-status', () => '')

  function show(text: string) {
    message.value = text
    if (!import.meta.client) return
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      message.value = ''
    }, 4200)
  }

  return { message, show }
}
