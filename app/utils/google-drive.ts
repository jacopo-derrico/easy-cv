interface TokenResponse {
  access_token?: string
  error?: string
}

interface TokenClient {
  requestAccessToken: () => void
}

interface PickerDocument {
  [key: string]: string
}

interface PickerResponse {
  [key: string]: unknown
  docs?: PickerDocument[]
}

declare global {
  interface Window {
    gapi?: {
      load: (name: string, options: { callback?: () => void }) => void
    }
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
      picker?: {
        PickerBuilder: new () => {
          addView: (view: unknown) => unknown
          setOAuthToken: (token: string) => unknown
          setDeveloperKey: (key: string) => unknown
          setAppId: (id: string) => unknown
          setCallback: (cb: (data: PickerResponse) => void) => unknown
          build: () => { setVisible: (visible: boolean) => void }
        }
        DocsView: new (viewId: string) => {
          setMimeTypes: (mime: string) => unknown
        }
        ViewId: { DOCS: string }
        Action: { PICKED: string, CANCEL: string, LOADED: string }
        Response: { ACTION: string, DOCUMENTS: string }
        Document: { ID: string }
      }
    }
  }
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

export function loadGis(): Promise<void> {
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

function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = () => {
      const gapi = window.gapi
      if (!gapi) {
        reject(new Error('gapi'))
        return
      }
      gapi.load('picker', { callback: () => resolve() })
    }
    if (window.gapi) {
      start()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-easy-cv-gapi]')
    if (existing) {
      existing.addEventListener('load', start, { once: true })
      existing.addEventListener('error', () => reject(new Error('gapi')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.async = true
    script.dataset.easyCvGapi = 'true'
    script.onload = start
    script.onerror = () => reject(new Error('gapi'))
    document.head.appendChild(script)
  })
}

export function requestDriveToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = window.google
    if (!google?.accounts?.oauth2) {
      reject(new Error('gis'))
      return
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.access_token) resolve(response.access_token)
        else reject(new Error(response.error || 'auth'))
      },
      error_callback: () => reject(new Error('auth')),
    })
    client.requestAccessToken()
  })
}

export async function pickDriveFile(
  apiKey: string,
  token: string,
  appId?: string | number,
): Promise<string | null> {
  await loadPickerApi()
  const google = window.google?.picker
  if (!google) throw new Error('picker')

  return new Promise((resolve, reject) => {
    const view = new google.DocsView(google.ViewId.DOCS)
    const builder = new google.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(apiKey)
    const projectId = appId === undefined || appId === null ? '' : String(appId).trim()
    if (projectId) builder.setAppId(projectId)
    const picker = builder
      .setCallback((data) => {
        const action = String(data[google.Response.ACTION] ?? data.action ?? '')
        if (action === google.Action.LOADED || action === 'loaded') return
        if (action === google.Action.CANCEL || action === 'cancel') {
          resolve(null)
          return
        }
        if (action !== google.Action.PICKED && action !== 'picked') return
        const docs = data.docs ?? data[google.Response.DOCUMENTS]
        const doc = Array.isArray(docs) ? docs[0] as PickerDocument | undefined : undefined
        const id = doc?.[google.Document.ID] ?? doc?.id
        if (typeof id === 'string' && id.length > 0) {
          resolve(id)
          return
        }
        reject(new Error('picker-id'))
      })
      .build()
    picker.setVisible(true)
  })
}

export async function downloadDriveFile(token: string, fileId: string): Promise<string> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(response.status === 403 ? 'forbidden' : String(response.status))
  return response.text()
}

export async function uploadDriveFile(token: string, name: string, body: string) {
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
