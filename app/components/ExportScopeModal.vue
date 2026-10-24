<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop no-print"
      @click.self="emit('close')"
    >
      <div
        class="modal-panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <h2 :id="titleId" class="modal-title">{{ title }}</h2>
        <p v-if="hint" class="modal-hint">{{ hint }}</p>
        <div class="modal-actions">
          <button type="button" class="btn primary" @click="emit('pick', 'current')">
            {{ t('export.jsonCurrent') }}
          </button>
          <button
            type="button"
            class="btn"
            :disabled="!allowAll"
            @click="emit('pick', 'all')"
          >
            {{ t('export.jsonAll') }}
          </button>
          <button type="button" class="btn modal-cancel" @click="emit('close')">
            {{ t('export.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  hint?: string
  allowAll: boolean
}>()

const emit = defineEmits<{
  close: []
  pick: [scope: 'current' | 'all']
}>()

const { t } = useI18n()
const titleId = 'export-scope-title'

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') emit('close')
}

watch(() => props.open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>
