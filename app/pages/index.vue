<template>
  <div class="home">
    <header class="bar">
      <p class="logo"><span>easy</span><b>cv</b></p>
      <span class="home-tools">
        <LocaleTheme />
      </span>
    </header>
    <main>
      <section class="hero">
        <p class="kicker">{{ t('home.kicker') }}</p>
        <h1>{{ t('home.title') }}</h1>
        <p class="lede">{{ t('home.lede') }}</p>
        <NuxtLink class="btn primary" to="/editor">{{ t('home.cta') }}</NuxtLink>
      </section>
      <section>
        <h2>{{ t('home.howTitle') }}</h2>
        <p>{{ t('home.how') }}</p>
      </section>
      <section>
        <h2>{{ t('home.customTitle') }}</h2>
        <ul>
          <li>{{ t('home.pointLayout') }}</li>
          <li>{{ t('home.pointLook') }}</li>
          <li>{{ t('home.pointSections') }}</li>
          <li>{{ t('home.pointCopies') }}</li>
        </ul>
      </section>
      <section>
        <h2>{{ t('home.privacyTitle') }}</h2>
        <p>{{ t('home.privacy') }}</p>
      </section>
      <section>
        <h2>{{ t('home.faqTitle') }}</h2>
        <div class="faq">
          <h3>{{ t('home.faqFreeQ') }}</h3>
          <p>{{ t('home.faqFreeA') }}</p>
          <h3>{{ t('home.faqPdfQ') }}</h3>
          <p>{{ t('home.faqPdfA') }}</p>
          <h3>{{ t('home.faqLangQ') }}</h3>
          <p>{{ t('home.faqLangA') }}</p>
          <h3>{{ t('home.faqCopiesQ') }}</h3>
          <p>{{ t('home.faqCopiesA') }}</p>
        </div>
        <p class="home-end">
          <NuxtLink to="/editor">{{ t('home.cta') }}</NuxtLink>
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('home.metaTitle'),
  ogTitle: () => t('home.metaTitle'),
  description: () => t('home.metaDescription'),
  ogDescription: () => t('home.metaDescription'),
})
</script>
