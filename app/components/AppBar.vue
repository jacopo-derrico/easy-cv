<template>
  <header class="bar no-print">
    <p class="logo"><span>easy</span><b>cv</b></p>
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
    <div class="bar-actions">
      <button type="button" class="btn" @click="onReset">{{ t('export.reset') }}</button>
      <button type="button" class="btn" @click="fileInput?.click()">{{ t('export.import') }}</button>
      <button type="button" class="btn primary" @click="onCsv">{{ t('export.csv') }}</button>
      <button type="button" class="btn" @click="onPrint">{{ t('export.print') }}</button>
      <button type="button" class="btn" @click="save">{{ t('export.drive') }}</button>
    </div>
    <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="onImport">
  </header>
</template>

<script setup lang="ts">
import { fileSlug } from '~/utils/document'
import { toCsv } from '~/utils/csv'
import { downloadText } from '~/utils/download'

const cv = useCvStore()
const { t, locale, setLocale } = useI18n()
const { dark, toggle } = useTheme()
const { show } = useStatus()
const { sectionTitle } = useSectionTitle()
const { save } = useDrive()
const fileInput = ref<HTMLInputElement | null>(null)

function onLocale(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'it' || value === 'en') setLocale(value)
}

function onReset() {
  if (!confirm(t('confirm.reset'))) return
  cv.reset()
  show(t('status.reset'))
}

function onImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!confirm(t('confirm.import'))) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result))
      if (!cv.replace(data)) {
        show(t('status.importFail'))
        return
      }
      show(t('status.imported'))
    }
    catch {
      show(t('status.importFail'))
    }
  }
  reader.readAsText(file)
}

function onCsv() {
  const header = [
    t('csv.section'),
    t('csv.format'),
    t('csv.title'),
    t('csv.subtitle'),
    t('csv.start'),
    t('csv.end'),
    t('csv.location'),
    t('csv.description'),
    t('csv.email'),
    t('csv.phone'),
    t('csv.website'),
  ]
  const content = toCsv(cv.doc, header, t('csv.profile'), sectionTitle)
  downloadText(`${fileSlug(cv.doc.profile.fullName)}.csv`, `\uFEFF${content}`, 'text/csv;charset=utf-8')
  show(t('status.csv'))
}

function onPrint() {
  const name = cv.doc.profile.fullName.trim()
  const previous = document.title
  if (name) document.title = `${name} — CV`
  window.addEventListener('afterprint', () => {
    document.title = previous
  }, { once: true })
  window.print()
}
</script>
