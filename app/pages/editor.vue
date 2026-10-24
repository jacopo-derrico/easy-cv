<template>
  <div class="app">
    <div v-if="!cv.ready" class="boot">
      <p class="logo"><span>easy</span><b>cv</b></p>
    </div>
    <template v-else>
      <AppBar />
      <p v-if="message" class="toast no-print" role="status">{{ message }}</p>
      <div class="pane-tabs no-print">
        <button type="button" :aria-pressed="pane === 'edit'" @click="pane = 'edit'">{{ t('nav.edit') }}</button>
        <button type="button" :aria-pressed="pane === 'preview'" @click="pane = 'preview'">{{ t('nav.preview') }}</button>
      </div>
      <main class="workspace" :data-pane="pane">
        <CvEditor />
        <CvPreview />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
const cv = useCvStore()
const pane = useEditorPane()
const { message, show } = useStatus()
const { t } = useI18n()

onMounted(() => {
  void cv.hydrate()
})

watch(() => cv.storageError, (failed) => {
  if (failed) show(t('status.storage'))
})

useSeoMeta({
  title: () => t('editor.metaTitle'),
  ogTitle: () => t('editor.metaTitle'),
  description: () => t('app.description'),
  robots: 'noindex, follow',
})
</script>
