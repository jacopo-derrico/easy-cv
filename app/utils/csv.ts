import type { CvDocument, CvSection } from '~/utils/document'

function cell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

export function toCsv(
  doc: CvDocument,
  header: string[],
  profileLabel: string,
  titleOf: (section: CvSection) => string,
): string {
  const rows: string[][] = [header]
  const profile = doc.profile
  rows.push([
    profileLabel,
    'profile',
    profile.fullName,
    profile.role,
    '',
    '',
    profile.location,
    profile.summary,
    profile.email,
    profile.phone,
    profile.website,
  ])

  for (const section of doc.sections) {
    const name = titleOf(section)
    if (section.format === 'text') {
      rows.push([name, section.format, '', '', '', '', '', section.body, '', '', ''])
      continue
    }
    const items = section.items.filter(item =>
      section.format === 'tags' ? item.title.trim() : [item.title, item.subtitle, item.start, item.end, item.location, item.description].some(value => value.trim()),
    )
    if (items.length === 0) {
      rows.push([name, section.format, '', '', '', '', '', '', '', '', ''])
      continue
    }
    for (const item of items) {
      rows.push([
        name,
        section.format,
        item.title,
        item.subtitle,
        item.start,
        item.end,
        item.location,
        item.description,
        '',
        '',
        '',
      ])
    }
  }

  return rows.map(row => row.map(cell).join(',')).join('\r\n')
}
