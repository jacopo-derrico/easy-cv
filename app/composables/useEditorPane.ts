export type EditorPane = 'edit' | 'preview'

export function useEditorPane() {
  return useState<EditorPane>('editor-pane', () => 'edit')
}
