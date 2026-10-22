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
    <p class="copy-count">{{ t('copies.count', { n: cv.createdIndexes.length }) }}</p>
    <label class="copy">
      <span class="sr-only">{{ t('copies.label') }}</span>
      <select :value="String(cv.active)" @change="onCopy">
        <option v-for="index in cv.createdIndexes" :key="index" :value="String(index)">
          {{ copyLabel(index) }}
        </option>
        <option v-if="cv.createdIndexes.length < 3" value="new">{{ t('copies.add') }}</option>
      </select>
    </label>
    <div class="bar-actions">
      <button type="button" class="btn" @click="onReset">{{ t('export.reset') }}</button>
      <button type="button" class="btn" @click="fileInput?.click()">{{ t('export.import') }}</button>
      <button type="button" class="btn primary" @click="onJson">{{ t('export.json') }}</button>
      <button type="button" class="btn" @click="onPrint">{{ t('export.print') }}</button>
      <button type="button" class="btn" @click="save">{{ t('export.drive') }}</button>
    </div>
    <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="onImport">
  </header>
</template>

<script setup lang="ts">
import { fileSlug, pack } from '~/utils/document'
import { downloadText } from '~/utils/download'

const cv = useCvStore()
const { t, locale, setLocale } = useI18n()
const { dark, toggle } = useTheme()
const { show } = useStatus()
const { save } = useDrive()
const fileInput = ref<HTMLInputElement | null>(null)

function onLocale(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'it' || value === 'en') setLocale(value)
}

function copyLabel(index: number) {
  const name = cv.slotName(index)
  return name
    ? t('copies.named', { n: index + 1, name })
    : t('copies.empty', { n: index + 1 })
}

function onCopy(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'new') cv.createSlot()
  else cv.openSlot(Number(value))
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

function onJson() {
  const content = JSON.stringify(pack(cv.doc), null, 2)
  downloadText(`${fileSlug(cv.doc.profile.fullName)}.json`, content, 'application/json')
  show(t('status.json'))
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
