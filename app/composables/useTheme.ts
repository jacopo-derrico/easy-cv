export function useTheme() {
  const dark = ref(false)
  if (import.meta.client) dark.value = document.documentElement.classList.contains('dark')

  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('easy-cv-theme', next ? 'dark' : 'light')
    dark.value = next
  }

  return { dark, toggle }
}
