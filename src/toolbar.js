// imports from 'slate' and 'slate-react'
import { Slate, Editable, withReact } from 'slate-react'

// Import the `Editor` and `Transforms` helpers from Slate.
import { Editor, Transforms, Element, Node } from 'slate'

import { File, Folder, Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, CodeXml } from 'lucide-react';

import { CustomEditor } from './editorChanges.js';

const Toolbar = ({ editor }) => {
  return (
    <div style={{
      display: 'flex', margin: 'auto', padding: '8px 6px', borderRadius: '8px', backgroundColor: '#e0e0e0', gap: '8px', width: 'fit-content'
    }}>
      <button
        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleBoldMark(editor)
        }}
      >
        <Bold size={20} strokeWidth={3} />
      </button>
      <button
        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleItalicMark(editor)
        }}
      >
        <Italic size={20} />
      </button>
      <button
        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleStrikethroughMark(editor)
        }}
      >
        <Strikethrough size={20} />
      </button>
      <button
        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleHeading(editor, 1)
        }}
      >
        <Heading1 size={20} />
      </button>
      <button
        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleHeading(editor, 2)
        }}
      >
        <Heading2 size={20} />
      </button>
      <button
        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleHeading(editor, 3)
        }}
      >
        <Heading3 size={20} />
      </button>
      <button
        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        onMouseDown={event => {
          event.preventDefault()
          CustomEditor.toggleCodeBlock(editor)
        }}
      >
        <CodeXml size={20} />
      </button>
    </div>
  )
}

export { Toolbar };