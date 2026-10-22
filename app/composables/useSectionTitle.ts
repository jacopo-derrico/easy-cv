import type { CvSection } from '~/utils/document'

export function useSectionTitle() {
  const { t } = useI18n()

  function defaultTitle(section: CvSection) {
    if (section.kind === 'custom') return t('sections.untitled')
    return t(`sections.${section.kind}`)
  }

  function sectionTitle(section: CvSection) {
    return section.label.trim() || defaultTitle(section)
  }

  return { defaultTitle, sectionTitle }
}
