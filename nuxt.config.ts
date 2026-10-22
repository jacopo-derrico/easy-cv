// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/seo'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      // OAuth Client ID (Web). Scope: https://www.googleapis.com/auth/drive.file
      googleClientId: '',
    },
  },
  app: {
    head: {
      title: 'easy cv',
      titleTemplate: '%s',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap',
        },
      ],
      script: [
        {
          key: 'theme',
          tagPosition: 'head',
          innerHTML: `(function(){try{var t=localStorage.getItem('easy-cv-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
        },
      ],
    },
  },
  site: {
    url: 'http://localhost:3000',
    name: 'easy cv',
    description: 'Editor di curriculum gratuito nel browser: layout, colori, foto e sezioni a scelta. I dati restano sul dispositivo. Esporta in JSON o stampa in PDF.',
  },
  i18n: {
    locales: [
      { code: 'it', language: 'it-IT', name: 'Italiano', file: 'it.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'it',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'easy_cv_locale',
      fallbackLocale: 'it',
    },
  },
})
