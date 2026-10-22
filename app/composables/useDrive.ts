import { fileSlug, pack } from '~/utils/document'

interface TokenResponse {
  access_token?: string
  error?: string
}

interface TokenClient {
  requestAccessToken: () => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
            error_callback?: () => void
          }) => TokenClient
        }
      }
    }
  }
}

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-easy-cv-gis]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('gis')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.dataset.easyCvGis = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('gis'))
    document.head.appendChild(script)
  })
}

function requestToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = window.google
    if (!google?.accounts?.oauth2) {
      reject(new Error('gis'))
      return
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        if (response.access_token) resolve(response.access_token)
        else reject(new Error(response.error || 'auth'))
      },
      error_callback: () => reject(new Error('auth')),
    })
    client.requestAccessToken()
  })
}

async function upload(token: string, name: string, body: string) {
  const boundary = `easy-cv-${crypto.randomUUID()}`
  const metadata = JSON.stringify({ name, mimeType: 'application/json' })
  const payload = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    body,
    `--${boundary}--`,
    '',
  ].join('\r\n')

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: payload,
  })
  if (!response.ok) throw new Error(String(response.status))
}

export function useDrive() {
  const config = useRuntimeConfig()
  const cv = useCvStore()
  const { t } = useI18n()
  const { show } = useStatus()

  async function save() {
    const clientId = config.public.googleClientId
    if (!clientId) {
      show(t('drive.missing'))
      return
    }
    try {
      await loadGis()
      const token = await requestToken(clientId)
      const name = `${fileSlug(cv.doc.profile.fullName)}.json`
      await upload(token, name, JSON.stringify(pack(cv.doc), null, 2))
      show(t('drive.ok'))
    }
    catch {
      show(t('drive.fail'))
    }
  }

  return { save }
}
