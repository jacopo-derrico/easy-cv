<template>
  <header class="bar no-print">
    <NuxtLink to="/" class="logo"><span>easy</span><b>cv</b></NuxtLink>
    <LocaleTheme />
    <p class="copy-count">{{ t('copies.count', { n: cv.createdIndexes.length }) }}</p>
    <label v-if="cv.createdIndexes.length > 1" class="copy">
      <span class="sr-only">{{ t('copies.label') }}</span>
      <select :value="String(cv.active)" @change="onCopy">
        <option v-for="index in cv.createdIndexes" :key="index" :value="String(index)">
          {{ copyLabel(index) }}
        </option>
      </select>
    </label>
    <div class="bar-actions">
      <button
        type="button"
        class="btn primary"
        :disabled="cv.createdIndexes.length >= 3"
        @click="onNew"
      >
        {{ t('export.new') }}
      </button>
      <button type="button" class="btn" @click="fileInput?.click()">{{ t('export.import') }}</button>
      <div ref="jsonMenu" class="split-btn">
        <button type="button" class="split-main" @click="onJsonCurrent">
          {{ t('export.json') }}
        </button>
        <button
          type="button"
          class="split-toggle"
          :aria-expanded="jsonOpen"
          :aria-label="t('export.jsonMenu')"
          @click="jsonOpen = !jsonOpen"
        >
          <svg viewBox="0 0 12 8" aria-hidden="true">
            <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </button>
        <div v-if="jsonOpen" class="split-menu" role="menu">
          <button type="button" role="menuitem" @click="onJsonCurrent">
            {{ t('export.jsonCurrent') }}
          </button>
          <button
            type="button"
            role="menuitem"
            :disabled="cv.createdIndexes.length < 2"
            @click="onJsonAll"
          >
            {{ t('export.jsonAll') }}
          </button>
        </div>
      </div>
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
const jsonMenu = ref<HTMLElement | null>(null)
const jsonOpen = ref(false)

function copyLabel(index: number) {
  const name = cv.slotName(index)
  return name
    ? t('copies.named', { n: index + 1, name })
    : t('copies.empty', { n: index + 1 })
}

function onCopy(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  cv.openSlot(value)
}

function onNew() {
  if (cv.createdIndexes.length >= 3) return
  cv.createSlot()
  show(t('status.created'))
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

function closeJsonMenu() {
  jsonOpen.value = false
}

function onJsonCurrent() {
  const content = JSON.stringify(pack(cv.doc), null, 2)
  downloadText(`${fileSlug(cv.doc.profile.fullName)}-easy-cv.json`, content, 'application/json')
  show(t('status.json'))
  closeJsonMenu()
}

function onJsonAll() {
  if (cv.createdIndexes.length < 2) return
  const content = JSON.stringify(cv.librarySnapshot(), null, 2)
  downloadText('easy-cv-all.json', content, 'application/json')
  show(t('status.jsonAll'))
  closeJsonMenu()
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

function onDocumentClick(event: MouseEvent) {
  if (!jsonOpen.value) return
  const target = event.target
  if (target instanceof Node && jsonMenu.value?.contains(target)) return
  closeJsonMenu()
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>
