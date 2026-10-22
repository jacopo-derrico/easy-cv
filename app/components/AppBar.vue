<template>
  <header class="bar no-print">
    <p class="logo"><span>easy</span><b>cv</b></p>
    <div class="seg" role="group" :aria-label="t('nav.lang')">
      <button type="button" :aria-pressed="locale === 'it'" @click="setLocale('it')">IT</button>
      <button type="button" :aria-pressed="locale === 'en'" @click="setLocale('en')">EN</button>
    </div>
    <button type="button" class="btn" @click="toggle()">
      {{ dark ? t('nav.themeLight') : t('nav.themeDark') }}
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
