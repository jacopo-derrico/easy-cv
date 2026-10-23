export type LayoutId = 'editorial' | 'classic' | 'split'
export type FontId = 'serif' | 'sans' | 'mono'
export type PaperId = 'white' | 'cream' | 'ink'
export type SectionFormat = 'entries' | 'tags' | 'text'
export type SectionKind = 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'custom'

export interface CvEntry {
  id: string
  title: string
  subtitle: string
  start: string
  end: string
  location: string
  description: string
  url: string
}

export interface CvSection {
  id: string
  kind: SectionKind
  format: SectionFormat
  label: string
  visible: boolean
  body: string
  items: CvEntry[]
}

export interface CvProfile {
  fullName: string
  role: string
  email: string
  phone: string
  location: string
  website: string
  websiteUrl: string
  summary: string
  photo: string
}

export interface CvDesign {
  layout: LayoutId
  accent: string
  font: FontId
  paper: PaperId
}

export interface CvDocument {
  profile: CvProfile
  design: CvDesign
  sections: CvSection[]
}

const layouts = new Set<LayoutId>(['editorial', 'classic', 'split'])
const fonts = new Set<FontId>(['serif', 'sans', 'mono'])
const papers = new Set<PaperId>(['white', 'cream', 'ink'])
const formats = new Set<SectionFormat>(['entries', 'tags', 'text'])
const kinds = new Set<SectionKind>(['experience', 'education', 'skills', 'languages', 'projects', 'custom'])

export function uid(): string {
  return crypto.randomUUID()
}

export function emptyProfile(): CvProfile {
  return {
    fullName: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    websiteUrl: '',
    summary: '',
    photo: '',
  }
}

export function emptyEntry(title = ''): CvEntry {
  return {
    id: uid(),
    title,
    subtitle: '',
    start: '',
    end: '',
    location: '',
    description: '',
    url: '',
  }
}

function section(kind: SectionKind, format: SectionFormat): CvSection {
  return { id: uid(), kind, format, label: '', visible: true, body: '', items: [] }
}

export function defaultDocument(): CvDocument {
  return {
    profile: emptyProfile(),
    design: {
      layout: 'editorial',
      accent: '#b4531a',
      font: 'serif',
      paper: 'cream',
    },
    sections: [
      section('experience', 'entries'),
      section('education', 'entries'),
      section('skills', 'tags'),
      section('languages', 'tags'),
      section('projects', 'entries'),
    ],
  }
}

export function pack(document: CvDocument) {
  return { app: 'easy-cv', version: 1 as const, document }
}

function str(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.slice(0, max)
}

function safePhoto(value: unknown): string {
  if (typeof value !== 'string' || value.length > 600_000) return ''
  if (/^data:image\/(jpeg|png|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(value)) return value
  return ''
}

function readEntry(value: unknown): CvEntry | null {
  if (!value || typeof value !== 'object') return null
  const entry = value as Record<string, unknown>
  return {
    id: str(entry.id, 80) || uid(),
    title: str(entry.title, 200),
    subtitle: str(entry.subtitle, 200),
    start: str(entry.start, 40),
    end: str(entry.end, 40),
    location: str(entry.location, 160),
    description: str(entry.description, 4000),
    url: str(entry.url, 500),
  }
}

function readSection(value: unknown): CvSection | null {
  if (!value || typeof value !== 'object') return null
  const sectionValue = value as Record<string, unknown>
  const kind = kinds.has(sectionValue.kind as SectionKind) ? sectionValue.kind as SectionKind : 'custom'
  const format = formats.has(sectionValue.format as SectionFormat) ? sectionValue.format as SectionFormat : 'entries'
  const items = Array.isArray(sectionValue.items)
    ? sectionValue.items.map(readEntry).filter((item): item is CvEntry => item !== null)
    : []
  return {
    id: str(sectionValue.id, 80) || uid(),
    kind,
    format,
    label: str(sectionValue.label, 120),
    visible: sectionValue.visible !== false,
    body: str(sectionValue.body, 8000),
    items,
  }
}

function readDesign(value: unknown): CvDesign {
  const design: CvDesign = {
    layout: 'editorial',
    accent: '#b4531a',
    font: 'serif',
    paper: 'cream',
  }
  if (!value || typeof value !== 'object') return design
  const raw = value as Record<string, unknown>
  if (layouts.has(raw.layout as LayoutId)) design.layout = raw.layout as LayoutId
  if (fonts.has(raw.font as FontId)) design.font = raw.font as FontId
  if (papers.has(raw.paper as PaperId)) design.paper = raw.paper as PaperId
  const accent = str(raw.accent, 7)
  if (/^#[0-9a-fA-F]{6}$/.test(accent)) design.accent = accent.toLowerCase()
  return design
}

function readProfile(value: unknown): CvProfile {
  const raw = value as Record<string, unknown>
  return {
    fullName: str(raw.fullName, 160),
    role: str(raw.role, 160),
    email: str(raw.email, 160),
    phone: str(raw.phone, 60),
    location: str(raw.location, 160),
    website: str(raw.website, 200),
    websiteUrl: str(raw.websiteUrl, 500),
    summary: str(raw.summary, 4000),
    photo: safePhoto(raw.photo),
  }
}

export function normalizeDocument(input: unknown): CvDocument | null {
  if (!input || typeof input !== 'object') return null
  const root = input as Record<string, unknown>
  const source = root.document && typeof root.document === 'object'
    ? root.document as Record<string, unknown>
    : root
  if (!source.profile || typeof source.profile !== 'object') return null
  return {
    profile: readProfile(source.profile),
    design: readDesign(source.design),
    sections: Array.isArray(source.sections)
      ? source.sections.map(readSection).filter((item): item is CvSection => item !== null)
      : defaultDocument().sections,
  }
}

export function entryHasContent(entry: CvEntry): boolean {
  return [entry.title, entry.subtitle, entry.start, entry.end, entry.location, entry.description, entry.url]
    .some(value => value.trim())
}

export function sectionHasContent(sectionValue: CvSection): boolean {
  if (!sectionValue.visible) return false
  if (sectionValue.format === 'text') return sectionValue.body.trim().length > 0
  return sectionValue.items.some(item =>
    sectionValue.format === 'tags' ? item.title.trim().length > 0 : entryHasContent(item),
  )
}

export function fileSlug(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return slug || 'cv'
}

export function externalHref(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function externalLabel(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

export function profileWebsiteContact(profile: CvProfile): { label: string, href: string } | null {
  const url = profile.websiteUrl.trim() || profile.website.trim()
  if (!url) return null
  const href = externalHref(profile.websiteUrl.trim() || profile.website)
  const label = profile.website.trim() || externalLabel(profile.websiteUrl.trim() || profile.website)
  return { label, href }
}

export function entryMeta(entry: CvEntry): string {
  const dates = [entry.start, entry.end].filter(Boolean).join(' – ')
  return [dates, entry.location].filter(Boolean).join(' · ')
}
