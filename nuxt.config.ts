// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/seo'],
  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      // OAuth Client ID (Web). Scope: https://www.googleapis.com/auth/drive.file
      googleClientId: '',
      googleApiKey: '',
      // Numero progetto Google Cloud (non il Client ID OAuth) — richiesto dal Picker.
      googleAppId: '',
      kofiUrl: 'https://ko-fi.com/K1S52AAFQQ',
      // ca-pub-… e lo slot dell’unità. Vuoti: il footer non carica AdSense.
      adsenseClient: '',
      adsenseSlot: '',
    },
  },
  app: {
    head: {
      title: 'Easy-CV',
      titleTemplate: '%s',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
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
    url: 'https://easy-cv.app',
    name: 'Easy-CV',
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
