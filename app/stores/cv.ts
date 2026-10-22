import { defaultDocument, emptyEntry, normalizeDocument, pack, uid, type CvDocument, type SectionFormat } from '~/utils/document'

const STORAGE_KEY = 'easy-cv'

export const useCvStore = defineStore('cv', () => {
  const doc = ref<CvDocument>(defaultDocument())
  const ready = ref(false)
  const storageError = ref(false)

  function hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = normalizeDocument(JSON.parse(raw))
        if (parsed) doc.value = parsed
      }
    }
    catch {
      // Keep the empty document when storage is unreadable.
    }
    ready.value = true
  }

  watch(doc, () => {
    if (!ready.value) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pack(doc.value)))
      storageError.value = false
    }
    catch {
      storageError.value = true
    }
  }, { deep: true })

  function reset() {
    doc.value = defaultDocument()
  }

  function replace(input: unknown) {
    const parsed = normalizeDocument(input)
    if (!parsed) return false
    doc.value = parsed
    return true
  }

  function addSection(label: string, format: SectionFormat) {
    const id = uid()
    doc.value.sections.push({
      id,
      kind: 'custom',
      format,
      label: label.trim(),
      visible: true,
      body: '',
      items: [],
    })
    return id
  }

  function removeSection(id: string) {
    doc.value.sections = doc.value.sections.filter(section => section.id !== id)
  }

  function moveSection(id: string, direction: -1 | 1) {
    const list = doc.value.sections
    const index = list.findIndex(section => section.id === id)
    const next = index + direction
    if (index < 0 || next < 0 || next >= list.length) return
    const [item] = list.splice(index, 1)
    if (item) list.splice(next, 0, item)
  }

  function addEntry(sectionId: string) {
    const section = doc.value.sections.find(item => item.id === sectionId)
    if (!section) return
    section.items.push(emptyEntry())
  }

  return {
    doc,
    ready,
    storageError,
    hydrate,
    reset,
    replace,
    addSection,
    removeSection,
    moveSection,
    addEntry,
  }
})
