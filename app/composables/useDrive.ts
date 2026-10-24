import { fileSlug, pack } from '~/utils/document'
import {
  downloadDriveFile,
  loadGis,
  pickDriveFile,
  requestDriveToken,
  uploadDriveFile,
} from '~/utils/google-drive'

export function useDrive() {
  const config = useRuntimeConfig()
  const cv = useCvStore()
  const { t } = useI18n()
  const { show } = useStatus()

  function credentials() {
    const clientId = config.public.googleClientId
    const apiKey = config.public.googleApiKey
    const appId = String(config.public.googleAppId ?? '').trim()
    return { clientId, apiKey, appId }
  }

  async function save(scope: 'current' | 'all') {
    const { clientId } = credentials()
    if (!clientId) {
      show(t('drive.missing'))
      return
    }
    if (scope === 'all' && cv.createdIndexes.length < 2) return
    try {
      await loadGis()
      const token = await requestDriveToken(clientId)
      const all = scope === 'all'
      const name = all ? 'easy-cv-all.json' : `${fileSlug(cv.doc.profile.fullName)}.json`
      const body = all
        ? JSON.stringify(cv.librarySnapshot(), null, 2)
        : JSON.stringify(pack(cv.doc), null, 2)
      await uploadDriveFile(token, name, body)
      show(all ? t('drive.okAll') : t('drive.ok'))
    }
    catch {
      show(t('drive.fail'))
    }
  }

  async function importFile(): Promise<unknown | null> {
    const { clientId, apiKey, appId } = credentials()
    if (!clientId || !apiKey) {
      show(t('drive.missingImport'))
      return null
    }
    if (!appId) {
      show(t('drive.missingAppId'))
      return null
    }
    try {
      await loadGis()
      const token = await requestDriveToken(clientId)
      const fileId = await pickDriveFile(apiKey, token, appId)
      if (!fileId) {
        show(t('drive.importCancelled'))
        return null
      }
      const text = await downloadDriveFile(token, fileId)
      return JSON.parse(text) as unknown
    }
    catch (error) {
      if (error instanceof Error && error.message === 'forbidden') show(t('drive.importForbidden'))
      else show(t('drive.importFail'))
      return null
    }
  }

  return { save, importFile }
}
