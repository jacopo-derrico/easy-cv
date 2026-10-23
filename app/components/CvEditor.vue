<template>
  <aside class="editor no-print">
    <p v-if="cv.storageError" class="warning">{{ t('status.storage') }}</p>

    <section class="panel">
      <h2 class="kicker">{{ t('design.layout') }}</h2>
      <div class="layouts">
        <button
          v-for="layout in layouts"
          :key="layout"
          type="button"
          class="layout-pick"
          :class="{ on: cv.doc.design.layout === layout }"
          :aria-pressed="cv.doc.design.layout === layout"
          @click="cv.doc.design.layout = layout"
        >
          <span class="mini" :class="`mini-${layout}`" aria-hidden="true">
            <i /><i /><i />
          </span>
          {{ t(`design.${layout}`) }}
        </button>
      </div>
      <div class="choices">
        <div class="choice">
          <span class="kicker">{{ t('design.accent') }}</span>
          <div class="swatches">
            <button
              v-for="color in swatches"
              :key="color"
              type="button"
              class="swatch"
              :class="{ on: cv.doc.design.accent === color }"
              :style="{ background: color }"
              :aria-label="color"
              :aria-pressed="cv.doc.design.accent === color"
              @click="cv.doc.design.accent = color"
            />
            <input v-model="cv.doc.design.accent" type="color" :aria-label="t('design.accent')">
          </div>
        </div>
        <div class="choice">
          <span class="kicker">{{ t('design.font') }}</span>
          <div class="seg">
            <button
              v-for="font in fonts"
              :key="font"
              type="button"
              :aria-pressed="cv.doc.design.font === font"
              @click="cv.doc.design.font = font"
            >
              {{ t(`design.${font}`) }}
            </button>
          </div>
        </div>
        <div class="choice">
          <span class="kicker">{{ t('design.paper') }}</span>
          <div class="seg">
            <button
              v-for="paper in papers"
              :key="paper"
              type="button"
              :aria-pressed="cv.doc.design.paper === paper"
              @click="cv.doc.design.paper = paper"
            >
              {{ t(`design.${paper}`) }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2 class="kicker">{{ t('profile.title') }}</h2>
      <div class="photo-row">
        <img v-if="cv.doc.profile.photo" :src="cv.doc.profile.photo" alt="" class="thumb">
        <button type="button" class="btn" @click="photoInput?.click()">{{ t('profile.photo') }}</button>
        <button v-if="cv.doc.profile.photo" type="button" class="btn" @click="cv.doc.profile.photo = ''">
          {{ t('profile.photoRemove') }}
        </button>
        <input ref="photoInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="onPhoto">
      </div>
      <div class="fields">
        <label class="field">
          <span>{{ t('profile.name') }}</span>
          <input v-model="cv.doc.profile.fullName" autocomplete="name">
        </label>
        <label class="field">
          <span>{{ t('profile.role') }}</span>
          <input v-model="cv.doc.profile.role">
        </label>
        <div class="grid-2">
          <label class="field">
            <span>{{ t('profile.email') }}</span>
            <input v-model="cv.doc.profile.email" type="email" autocomplete="email">
          </label>
          <label class="field">
            <span>{{ t('profile.phone') }}</span>
            <input v-model="cv.doc.profile.phone" type="tel" autocomplete="tel">
          </label>
        </div>
        <label class="field">
          <span>{{ t('profile.location') }}</span>
          <input v-model="cv.doc.profile.location" autocomplete="address-level2">
        </label>
        <div class="grid-2">
          <label class="field">
            <span>{{ t('profile.website') }}</span>
            <input v-model="cv.doc.profile.website" autocomplete="off">
          </label>
          <label class="field">
            <span>{{ t('profile.websiteUrl') }}</span>
            <input v-model="cv.doc.profile.websiteUrl" type="url" autocomplete="url" inputmode="url">
          </label>
        </div>
        <label class="field">
          <span>{{ t('profile.summary') }}</span>
          <textarea v-model="cv.doc.profile.summary" rows="4" />
        </label>
      </div>
    </section>

    <section class="panel">
      <h2 class="kicker">{{ t('social.title') }}</h2>
      <p class="lead">{{ t('social.lead') }}</p>
      <div class="choice">
        <span class="kicker">{{ t('social.size') }}</span>
        <div class="seg">
          <button
            v-for="size in socialSizes"
            :key="size"
            type="button"
            :aria-pressed="cv.doc.profile.socialIconSize === size"
            @click="cv.doc.profile.socialIconSize = size"
          >
            {{ t(`social.size-${size}`) }}
          </button>
        </div>
      </div>
      <label class="field social-flag">
        <input v-model="cv.doc.profile.socialShowLabels" type="checkbox">
        <span>{{ t('social.showLabels') }}</span>
      </label>
      <article v-for="(link, index) in cv.doc.profile.socialLinks" :key="link.id" class="social-link">
        <div class="social-link-bar">
          <span class="kicker">{{ t('social.icon') }}</span>
          <button type="button" class="btn danger" @click="removeSocial(index)">{{ t('social.remove') }}</button>
        </div>
        <div class="social-picks">
          <button
            v-for="icon in socialIcons"
            :key="icon"
            type="button"
            class="social-pick"
            :class="{ on: link.icon === icon }"
            :aria-pressed="link.icon === icon"
            :aria-label="t(`social.icons.${icon}`)"
            @click="link.icon = icon"
          >
            <SocialIcon :icon="icon" :size="16" />
          </button>
        </div>
        <label class="field">
          <span>{{ t('social.label') }}</span>
          <input v-model="link.label" :placeholder="t('social.labelPlaceholder')">
        </label>
        <label class="field">
          <span>{{ t('social.url') }}</span>
          <input v-model="link.url" type="url" inputmode="url" :placeholder="t('entry.urlPlaceholder')">
        </label>
      </article>
      <button type="button" class="btn add-entry" @click="addSocial">{{ t('social.add') }}</button>
    </section>

    <section class="panel">
      <h2 class="kicker">{{ t('sections.title') }}</h2>
      <p class="lead">{{ t('sections.lead') }}</p>
      <div v-for="(section, index) in cv.doc.sections" :key="section.id" class="section" :class="{ 'is-off': !section.visible }">
        <div class="section-row">
          <button type="button" class="section-open" :aria-expanded="openId === section.id" @click="toggle(section.id)">
            {{ sectionTitle(section) }}
          </button>
          <div class="section-actions">
            <button type="button" class="btn" :disabled="index === 0" @click="cv.moveSection(section.id, -1)">{{ t('sections.up') }}</button>
            <button type="button" class="btn" :disabled="index === cv.doc.sections.length - 1" @click="cv.moveSection(section.id, 1)">{{ t('sections.down') }}</button>
            <button type="button" class="btn" @click="section.visible = !section.visible">
              {{ section.visible ? t('sections.hide') : t('sections.show') }}
            </button>
            <button type="button" class="btn danger" @click="remove(section.id)">{{ t('sections.delete') }}</button>
          </div>
        </div>
        <div v-if="openId === section.id" class="section-body">
          <div class="grid-2">
            <label class="field">
              <span>{{ t('sections.name') }}</span>
              <input v-model="section.label" :placeholder="defaultTitle(section)">
            </label>
            <label class="field">
              <span>{{ t('sections.format') }}</span>
              <select v-model="section.format">
                <option v-for="format in formats" :key="format" :value="format">{{ t(`sections.${format}`) }}</option>
              </select>
            </label>
          </div>

          <template v-if="section.format === 'text'">
            <label class="field">
              <span>{{ t('entry.description') }}</span>
              <textarea v-model="section.body" rows="5" />
            </label>
          </template>

          <template v-else-if="section.format === 'tags'">
            <ul class="chips">
              <li v-for="item in section.items" :key="item.id">
                {{ item.title }}
                <button type="button" :aria-label="t('entry.remove')" @click="removeItem(section, item.id)">×</button>
              </li>
            </ul>
            <div class="add-row tag-row">
              <input
                v-model="drafts[section.id]"
                :placeholder="t('entry.tag')"
                @keydown.enter.prevent="commitTag(section)"
              >
              <button type="button" class="btn" @click="commitTag(section)">{{ t('sections.add') }}</button>
            </div>
          </template>

          <template v-else>
            <article v-for="(item, itemIndex) in section.items" :key="item.id" class="entry">
              <div class="entry-bar">
                <button type="button" class="btn" :disabled="itemIndex === 0" @click="moveItem(section, itemIndex, -1)">{{ t('sections.up') }}</button>
                <button type="button" class="btn" :disabled="itemIndex === section.items.length - 1" @click="moveItem(section, itemIndex, 1)">{{ t('sections.down') }}</button>
                <button type="button" class="btn danger" @click="removeItem(section, item.id)">{{ t('entry.remove') }}</button>
              </div>
              <div class="fields">
                <div class="grid-2">
                  <label class="field">
                    <span>{{ t('entry.title') }}</span>
                    <input v-model="item.title">
                  </label>
                  <label class="field">
                    <span>{{ t('entry.subtitle') }}</span>
                    <input v-model="item.subtitle">
                  </label>
                </div>
                <div class="grid-2">
                  <label class="field">
                    <span>{{ t('entry.start') }}</span>
                    <input v-model="item.start">
                  </label>
                  <label class="field">
                    <span>{{ t('entry.end') }}</span>
                    <input v-model="item.end">
                  </label>
                </div>
                <label class="field">
                  <span>{{ t('entry.location') }}</span>
                  <input v-model="item.location">
                </label>
                <label class="field">
                  <span>{{ t('entry.url') }}</span>
                  <input v-model="item.url" type="url" inputmode="url" :placeholder="t('entry.urlPlaceholder')">
                </label>
                <label class="field">
                  <span>{{ t('entry.description') }}</span>
                  <textarea v-model="item.description" rows="3" />
                </label>
              </div>
            </article>
            <button type="button" class="btn add-entry" @click="cv.addEntry(section.id)">{{ t('entry.add') }}</button>
          </template>
        </div>
      </div>

      <div class="add-row">
        <input v-model="newLabel" :placeholder="t('sections.name')" @keydown.enter.prevent="add">
        <select v-model="newFormat">
          <option v-for="format in formats" :key="format" :value="format">{{ t(`sections.${format}`) }}</option>
        </select>
        <button type="button" class="btn primary" @click="add">{{ t('sections.add') }}</button>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { emptyEntry, type CvSection, type SectionFormat } from '~/utils/document'
import { readPhoto } from '~/utils/photo'
import { emptySocialLink, SOCIAL_ICONS, type SocialIconSize } from '~/utils/social'

const cv = useCvStore()
const { t } = useI18n()
const { show } = useStatus()
const { defaultTitle, sectionTitle } = useSectionTitle()

const layouts = ['editorial', 'classic', 'split'] as const
const fonts = ['serif', 'sans', 'mono'] as const
const papers = ['white', 'cream', 'ink'] as const
const formats = ['entries', 'tags', 'text'] as const
const swatches = ['#b4531a', '#1f6f5b', '#1e4d8c', '#7c3f2a', '#3f3a34']
const socialIcons = SOCIAL_ICONS
const socialSizes: SocialIconSize[] = ['s', 'm', 'l']

const openId = ref('')
const newLabel = ref('')
const newFormat = ref<SectionFormat>('entries')
const drafts = reactive<Record<string, string>>({})
const photoInput = ref<HTMLInputElement | null>(null)

function toggle(id: string) {
  openId.value = openId.value === id ? '' : id
}

function add() {
  const id = cv.addSection(newLabel.value, newFormat.value)
  newLabel.value = ''
  openId.value = id
}

function remove(id: string) {
  if (!confirm(t('confirm.delete'))) return
  cv.removeSection(id)
  if (openId.value === id) openId.value = ''
}

function removeItem(section: CvSection, id: string) {
  section.items = section.items.filter(item => item.id !== id)
}

function moveItem(section: CvSection, index: number, direction: -1 | 1) {
  const next = index + direction
  if (next < 0 || next >= section.items.length) return
  const [item] = section.items.splice(index, 1)
  if (item) section.items.splice(next, 0, item)
}

function commitTag(section: CvSection) {
  const title = (drafts[section.id] || '').trim()
  if (!title) return
  const exists = section.items.some(item => item.title.toLocaleLowerCase() === title.toLocaleLowerCase())
  if (!exists) section.items.push(emptyEntry(title))
  drafts[section.id] = ''
}

function addSocial() {
  cv.doc.profile.socialLinks.push(emptySocialLink())
}

function removeSocial(index: number) {
  cv.doc.profile.socialLinks.splice(index, 1)
}

async function onPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    cv.doc.profile.photo = await readPhoto(file)
  }
  catch {
    show(t('status.photo'))
  }
}
</script>
