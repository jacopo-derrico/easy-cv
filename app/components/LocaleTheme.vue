<template>
  <label class="lang">
    <span class="sr-only">{{ t('nav.lang') }}</span>
    <select :value="locale" @change="onLocale">
      <option value="it">Italiano</option>
      <option value="en">English</option>
    </select>
  </label>
  <button
    type="button"
    class="theme-toggle"
    :class="{ on: dark }"
    :aria-pressed="dark"
    :aria-label="dark ? t('nav.themeLight') : t('nav.themeDark')"
    @click="toggle()"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2.5v2.5M12 19v2.5M4.4 4.4l1.8 1.8M17.8 17.8l1.8 1.8M2.5 12H5M19 12h2.5M4.4 19.6l1.8-1.8M17.8 6.2l1.8-1.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 3.1a8.2 8.2 0 1 0 5.4 12.8A7 7 0 0 1 15.5 3.1z" />
    </svg>
    <span class="thumb" />
  </button>
</template>

<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const { dark, toggle } = useTheme()

function onLocale(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'it' || value === 'en') setLocale(value)
}
</script>
