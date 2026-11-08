<script setup lang="ts">
const config = useRuntimeConfig()
const client = config.public.adsenseClient
const slot = config.public.adsenseSlot
const enabled = Boolean(client && slot)

if (enabled) {
  useHead({
    script: [
      {
        key: 'adsbygoogle',
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`,
        async: true,
        crossorigin: 'anonymous',
      },
    ],
  })
}

onMounted(() => {
  if (!enabled) return
  const page = window as Window & { adsbygoogle?: object[] }
  page.adsbygoogle = page.adsbygoogle || []
  page.adsbygoogle.push({})
})
</script>

<template>
  <ins
    v-if="enabled"
    class="adsbygoogle ad-slot"
    data-ad-format="horizontal"
    data-full-width-responsive="false"
    :data-ad-client="client"
    :data-ad-slot="slot"
  />
</template>
