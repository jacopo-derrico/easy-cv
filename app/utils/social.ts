import { uid } from '~/utils/document'

function str(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.slice(0, max)
}

export type SocialIconId =
  | 'linkedin'
  | 'github'
  | 'x'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'mastodon'
  | 'telegram'
  | 'tiktok'
  | 'link'

export const SOCIAL_ICONS: SocialIconId[] = [
  'linkedin',
  'github',
  'x',
  'instagram',
  'facebook',
  'youtube',
  'mastodon',
  'telegram',
  'tiktok',
  'link',
]

const iconSet = new Set<SocialIconId>(SOCIAL_ICONS)

export type SocialIconSize = 's' | 'm' | 'l'

const iconSizes = new Set<SocialIconSize>(['s', 'm', 'l'])

export interface CvSocialLink {
  id: string
  icon: SocialIconId
  url: string
  label: string
}

export interface CvSocialPrefs {
  iconSize: SocialIconSize
  showLabels: boolean
}

export function emptySocialLink(icon: SocialIconId = 'link'): CvSocialLink {
  return { id: uid(), icon, url: '', label: '' }
}

export function defaultSocialPrefs(): CvSocialPrefs {
  return { iconSize: 'm', showLabels: false }
}

export function readSocialIconSize(value: unknown): SocialIconSize {
  const normalized = typeof value === 'string' ? value.toLowerCase() : value
  return iconSizes.has(normalized as SocialIconSize) ? normalized as SocialIconSize : 'm'
}

export function socialIconPixels(size: SocialIconSize): number {
  if (size === 's') return 14
  if (size === 'l') return 28
  return 22
}

export function readSocialLink(value: unknown): CvSocialLink | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const icon = iconSet.has(raw.icon as SocialIconId) ? raw.icon as SocialIconId : 'link'
  return {
    id: str(raw.id, 80) || uid(),
    icon,
    url: str(raw.url, 500),
    label: str(raw.label, 120),
  }
}

export function readSocialPrefs(raw: Record<string, unknown>): CvSocialPrefs {
  return {
    iconSize: readSocialIconSize(raw.socialIconSize),
    showLabels: raw.socialShowLabels === true,
  }
}

export function socialLinksWithUrl(links: CvSocialLink[]): CvSocialLink[] {
  return links.filter(link => link.url.trim())
}
