<template>
  <div ref="frame" class="stage">
    <div class="scale-box" :style="boxStyle">
      <article
        ref="sheet"
        class="sheet"
        :class="[`layout-${design.layout}`, `font-${design.font}`, `paper-${design.paper}`]"
        :style="{ transform: `scale(${scale})`, '--cv-accent': design.accent }"
      >
        <header class="cv-head">
          <img v-if="profile.photo" class="cv-photo" :src="profile.photo" :alt="profile.fullName">
          <div class="cv-id">
            <h1 v-if="profile.fullName" class="cv-name">{{ profile.fullName }}</h1>
            <h1 v-else class="cv-name placeholder">{{ t('preview.emptyName') }}</h1>
            <p v-if="profile.role" class="cv-role">{{ profile.role }}</p>
            <p v-else class="cv-role placeholder">{{ t('preview.emptyRole') }}</p>
            <ul v-if="contacts.length" class="cv-contacts">
              <li v-for="contact in contacts" :key="contact.label">
                <a v-if="contact.href" :href="contact.href">{{ contact.label }}</a>
                <template v-else>{{ contact.label }}</template>
              </li>
            </ul>
          </div>
        </header>
        <div class="cv-main">
          <p v-if="profile.summary" class="cv-summary">{{ profile.summary }}</p>
          <p v-else-if="visibleSections.length === 0" class="placeholder cv-hint">{{ t('preview.hint') }}</p>
          <div class="cv-sections">
            <section v-for="(section, index) in visibleSections" :key="section.id" class="cv-section">
              <h2><span>{{ String(index + 1).padStart(2, '0') }}</span> {{ sectionTitle(section) }}</h2>
              <p v-if="section.format === 'text'" class="cv-desc">{{ section.body }}</p>
              <ul v-else-if="section.format === 'tags'" class="cv-tags">
                <li v-for="item in tags(section)" :key="item.id">{{ item.title }}</li>
              </ul>
              <div v-else>
                <article v-for="item in entries(section)" :key="item.id" class="cv-entry">
                  <h3 v-if="item.title">{{ item.title }}</h3>
                  <p v-if="item.subtitle" class="cv-sub">{{ item.subtitle }}</p>
                  <p v-if="entryMeta(item)" class="cv-meta">{{ entryMeta(item) }}</p>
                  <p v-if="item.description" class="cv-desc">{{ item.description }}</p>
                </article>
              </div>
            </section>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { entryHasContent, entryMeta, sectionHasContent, websiteHref, websiteLabel, type CvSection } from '~/utils/document'

const SHEET_WIDTH = 794

const cv = useCvStore()
const { t } = useI18n()
const { sectionTitle } = useSectionTitle()

const frame = ref<HTMLElement | null>(null)
const sheet = ref<HTMLElement | null>(null)
const scale = ref(1)
const sheetHeight = ref(1123)
let observer: ResizeObserver | undefined

const profile = computed(() => cv.doc.profile)
const design = computed(() => cv.doc.design)
const visibleSections = computed(() => cv.doc.sections.filter(sectionHasContent))
const boxStyle = computed(() => ({
  width: `${SHEET_WIDTH * scale.value}px`,
  height: `${sheetHeight.value * scale.value}px`,
}))

const contacts = computed(() => {
  const items: { label: string, href?: string }[] = []
  if (profile.value.email) items.push({ label: profile.value.email, href: `mailto:${profile.value.email}` })
  if (profile.value.phone) items.push({ label: profile.value.phone, href: `tel:${profile.value.phone}` })
  if (profile.value.location) items.push({ label: profile.value.location })
  if (profile.value.website) {
    items.push({ label: websiteLabel(profile.value.website), href: websiteHref(profile.value.website) })
  }
  return items
})

function tags(section: CvSection) {
  return section.items.filter(item => item.title.trim())
}

function entries(section: CvSection) {
  return section.items.filter(entryHasContent)
}

function fit() {
  const width = frame.value?.clientWidth ?? SHEET_WIDTH
  scale.value = Math.min(1, Math.max(0.32, (width - 32) / SHEET_WIDTH))
  sheetHeight.value = sheet.value?.offsetHeight || 1123
}

onMounted(() => {
  fit()
  observer = new ResizeObserver(fit)
  if (frame.value) observer.observe(frame.value)
  if (sheet.value) observer.observe(sheet.value)
})

onBeforeUnmount(() => observer?.disconnect())

watch(() => cv.doc, () => nextTick(fit), { deep: true })
</script>
