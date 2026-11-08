<script setup lang="ts">
const { t } = useI18n()
const kofiUrl = useRuntimeConfig().public.kofiUrl
</script>

<template>
  <footer class="site-footer no-print">
    <p class="support-kofi">
      <span>{{ t('footer.supportLead') }}</span>
      <a :href="kofiUrl" target="_blank" rel="noopener noreferrer">
        <img
          height="36"
          style="border: 0; height: 36px"
          src="/kofi3.png"
          alt="Buy Me a Coffee at ko-fi.com"
        >
      </a>
    </p>
    <AdSlot />
  </footer>
</template>
