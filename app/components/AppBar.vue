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
      <div ref="importMenu" class="split-btn">
        <button type="button" class="split-main" @click="onImportFile">
          {{ t('export.import') }}
        </button>
        <button
          type="button"
          class="split-toggle"
          :aria-expanded="importOpen"
          :aria-label="t('export.importMenu')"
          @click="importOpen = !importOpen"
        >
          <svg viewBox="0 0 12 8" aria-hidden="true">
            <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </button>
        <div v-if="importOpen" class="split-menu" role="menu">
          <button type="button" role="menuitem" @click="onImportFile">
            {{ t('export.importJson') }}
          </button>
          <button type="button" role="menuitem" @click="onImportDrive">
            {{ t('export.importDrive') }}
          </button>
        </div>
      </div>
      <div ref="exportMenu" class="split-btn">
        <button type="button" class="split-main" @click="beginExport('local')">
          {{ t('export.json') }}
        </button>
        <button
          type="button"
          class="split-toggle"
          :aria-expanded="exportOpen"
          :aria-label="t('export.jsonMenu')"
          @click="exportOpen = !exportOpen"
        >
          <svg viewBox="0 0 12 8" aria-hidden="true">
            <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </button>
        <div v-if="exportOpen" class="split-menu" role="menu">
          <button type="button" role="menuitem" @click="beginExport('local')">
            {{ t('export.local') }}
          </button>
          <button type="button" role="menuitem" @click="beginExport('drive')">
            {{ t('export.drive') }}
          </button>
        </div>
      </div>
      <button type="button" class="btn" @click="onPrint">{{ t('export.print') }}</button>
    </div>
    <ExportScopeModal
      :open="exportModalOpen"
      :title="t('export.scopeTitle')"
      :allow-all="cv.createdIndexes.length >= 2"
      @close="exportModalOpen = false"
      @pick="onExportScope"
    />
    <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="onImportFilePicked">
  </header>
</template>

<script setup lang="ts">
import { fileSlug, pack } from '~/utils/document'
import { downloadText } from '~/utils/download'

const cv = useCvStore()
const { t } = useI18n()
const { show } = useStatus()
const { save, importFile } = useDrive()
const fileInput = ref<HTMLInputElement | null>(null)
const exportMenu = ref<HTMLElement | null>(null)
const importMenu = ref<HTMLElement | null>(null)
const exportOpen = ref(false)
const importOpen = ref(false)
const exportModalOpen = ref(false)
const exportTarget = ref<'local' | 'drive'>('local')

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

function closeMenus() {
  exportOpen.value = false
  importOpen.value = false
}

function beginExport(target: 'local' | 'drive') {
  exportTarget.value = target
  closeMenus()
  exportModalOpen.value = true
}

function applyImport(data: unknown) {
  if (!cv.replace(data)) {
    show(t('status.importFail'))
    return false
  }
  show(t('status.imported'))
  return true
}

function onImportFile() {
  closeMenus()
  fileInput.value?.click()
}

function onImportFilePicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!confirm(t('confirm.import'))) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      applyImport(JSON.parse(String(reader.result)))
    }
    catch {
      show(t('status.importFail'))
    }
  }
  reader.readAsText(file)
}

async function onImportDrive() {
  closeMenus()
  if (!confirm(t('confirm.import'))) return
  const data = await importFile()
  if (data === null) return
  applyImport(data)
}

function exportLocal(scope: 'current' | 'all') {
  if (scope === 'all') {
    if (cv.createdIndexes.length < 2) return
    const content = JSON.stringify(cv.librarySnapshot(), null, 2)
    downloadText('easy-cv-all.json', content, 'application/json')
    show(t('status.jsonAll'))
    return
  }
  const content = JSON.stringify(pack(cv.doc), null, 2)
  downloadText(`${fileSlug(cv.doc.profile.fullName)}-easy-cv.json`, content, 'application/json')
  show(t('status.json'))
}

async function onExportScope(scope: 'current' | 'all') {
  exportModalOpen.value = false
  if (exportTarget.value === 'drive') await save(scope)
  else exportLocal(scope)
}

function onPrint() {
  useEditorPane().value = 'preview'
  const name = cv.doc.profile.fullName.trim()
  const previous = document.title
  if (name) document.title = `${name} — CV`
  window.addEventListener('afterprint', () => {
    document.title = previous
  }, { once: true })
  window.print()
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (exportOpen.value && !exportMenu.value?.contains(target)) exportOpen.value = false
  if (importOpen.value && !importMenu.value?.contains(target)) importOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>
