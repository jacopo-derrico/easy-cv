<template>
  <header class="bar no-print">
    <NuxtLink to="/" class="logo"><span>easy</span><b>cv</b></NuxtLink>
    <LocaleTheme />
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
const { t } = useI18n()
const { show } = useStatus()
const { save } = useDrive()
const fileInput = ref<HTMLInputElement | null>(null)

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
