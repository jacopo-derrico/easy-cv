import { defaultDocument, emptyEntry, normalizeDocument, uid, type CvDocument, type SectionFormat } from '~/utils/document'

const STORAGE_KEY = 'easy-cv'
const SLOT_COUNT = 3

function emptySlots(): (CvDocument | null)[] {
  return Array.from({ length: SLOT_COUNT }, () => null)
}

function hasContent(document: CvDocument | null) {
  if (!document) return false
  const profile = document.profile
  if ([profile.fullName, profile.role, profile.email, profile.phone, profile.location, profile.website, profile.websiteUrl, profile.summary, profile.photo].some(value => value.trim())
    || profile.socialLinks.some(link => link.url.trim() || link.label.trim())
    || profile.socialShowLabels
    || profile.socialIconSize !== 'm') {
    return true
  }
  const design = document.design
  if (design.layout !== 'editorial' || design.accent !== '#b4531a' || design.font !== 'serif' || design.paper !== 'cream') {
    return true
  }
  return document.sections.some(section =>
    section.kind === 'custom'
    || section.label.trim().length > 0
    || section.body.trim().length > 0
    || section.items.some(item =>
      [item.title, item.subtitle, item.start, item.end, item.location, item.description, item.url].some(value => value.trim()),
    ),
  )
}

function readLibrary(input: unknown) {
  const slots = emptySlots()
  if (!input || typeof input !== 'object') return { active: 0, slots }
  const raw = input as Record<string, unknown>
  if (Array.isArray(raw.slots)) {
    for (let index = 0; index < SLOT_COUNT; index++) {
      slots[index] = raw.slots[index] ? normalizeDocument(raw.slots[index]) : null
    }
    const active = raw.active === 1 || raw.active === 2 ? raw.active : 0
    return { active, slots }
  }
  const legacy = normalizeDocument(input)
  if (legacy) slots[0] = legacy
  return { active: 0, slots }
}

export const useCvStore = defineStore('cv', () => {
  const doc = ref<CvDocument>(defaultDocument())
  const active = ref(0)
  const slots = ref<(CvDocument | null)[]>(emptySlots())
  const ready = ref(false)
  const storageError = ref(false)

  const createdIndexes = computed(() => {
    const indexes: number[] = []
    for (let index = 0; index < SLOT_COUNT; index++) {
      if (index === active.value || hasContent(slots.value[index])) indexes.push(index)
    }
    return indexes
  })

  function persist() {
    slots.value[active.value] = doc.value
    for (let index = 0; index < SLOT_COUNT; index++) {
      if (index !== active.value && !hasContent(slots.value[index])) slots.value[index] = null
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      app: 'easy-cv',
      version: 2,
      active: active.value,
      slots: slots.value,
    }))
  }

  function hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const library = readLibrary(JSON.parse(raw))
        active.value = library.active
        slots.value = library.slots
        const current = library.slots[library.active]
        const fallback = library.slots.findIndex(slot => hasContent(slot))
        if (current && (hasContent(current) || fallback < 0)) {
          doc.value = current
        }
        else if (fallback >= 0) {
          active.value = fallback
          doc.value = library.slots[fallback] as CvDocument
        }
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
      persist()
      storageError.value = false
    }
    catch {
      storageError.value = true
    }
  }, { deep: true })

  function openSlot(index: number) {
    const next = slots.value[index]
    if (!ready.value || index === active.value || !next || !hasContent(next)) return
    slots.value[active.value] = doc.value
    active.value = index
    doc.value = next
  }

  function createSlot() {
    if (!ready.value || createdIndexes.value.length >= SLOT_COUNT) return
    const index = slots.value.findIndex((slot, slotIndex) => slotIndex !== active.value && !hasContent(slot))
    if (index < 0) return
    slots.value[active.value] = doc.value
    const next = defaultDocument()
    slots.value[index] = next
    active.value = index
    doc.value = next
  }

  function slotName(index: number) {
    const source = index === active.value ? doc.value : slots.value[index]
    return source?.profile.fullName.trim() ?? ''
  }

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
    active,
    ready,
    storageError,
    hydrate,
    openSlot,
    createSlot,
    slotName,
    createdIndexes,
    reset,
    replace,
    addSection,
    removeSection,
    moveSection,
    addEntry,
  }
})
