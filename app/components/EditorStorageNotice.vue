<template>
  <div
    v-if="visible"
    class="editor-storage-notice no-print"
    role="status"
    :aria-label="t('notice.storageTitle')"
  >
    <button type="button" class="editor-storage-notice-close" :aria-label="t('notice.close')" @click="dismiss">
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path fill="none" stroke="currentColor" stroke-width="1.5" d="M2 2l8 8M10 2 2 10" />
      </svg>
    </button>
    <div class="editor-storage-notice-inner">
      <span class="editor-storage-notice-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2 1 21h22L12 2zm0 4.2 7.55 13.3H4.45L12 6.2z" />
          <path fill="currentColor" d="M11 10h2v5h-2zm0 6h2v2h-2z" />
        </svg>
      </span>
      <div class="editor-storage-notice-copy">
        <p class="editor-storage-notice-title">{{ t('notice.storageTitle') }}</p>
        <p class="editor-storage-notice-body">{{ t('notice.storageBody') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const DISMISS_KEY = 'easy-cv-storage-notice-dismissed'

const { t } = useI18n()
const visible = ref(false)

onMounted(() => {
  try {
    visible.value = localStorage.getItem(DISMISS_KEY) !== '1'
  }
  catch {
    visible.value = true
  }
})

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  }
  catch {
    // Ignore quota errors; hide for this session anyway.
  }
}
</script>
