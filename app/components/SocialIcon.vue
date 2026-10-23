<template>
  <svg
    class="social-icon-glyph"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
  >
    <path :d="path" />
  </svg>
</template>

<script setup lang="ts">
import { socialIconPath } from '~/utils/social-icon-paths'
import type { SocialIconId } from '~/utils/social'

const props = defineProps<{
  icon: SocialIconId
  size?: number
}>()

const path = computed(() => socialIconPath(props.icon))
</script>
