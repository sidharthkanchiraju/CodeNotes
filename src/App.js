// Import React dependencies.
import React, { useState, useCallback, useMemo } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'

// Import the `Editor` and `Transforms` helpers from Slate.
import { Editor, Transforms, Element, Node } from 'slate'

import { FileExplorer, FileTreeItem } from './fileexplorer.js';

import { CustomEditor, withCodeBlocks, CodeElement, DefaultElement, Leaf } from './editorChanges.js';

import { Toolbar } from './toolbar.js';

const App = () => {
  const [editor] = useState(() => withCodeBlocks(withReact(createEditor())))
  
  const handleFileClick = (file) => {
    console.log('File clicked:', file);

    // Load the file content into the editor
    if (file.content) {
      const newValue = [
        {
          type: 'paragraph',
          children: [{ text: file.content }],
        },
      ];

      // Update the editor
      Transforms.delete(editor, {
        at: {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        },
      });

      Transforms.insertNodes(editor, newValue);
    }
  };

  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem('content')) || [
        {
          type: 'paragraph',
          children: [{ text: 'A line of text in a paragraph.' }],
        },
      ],
    []
  )

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      case 'heading1':
        return <h1 {...props.attributes}>{props.children}</h1>
      case 'heading2':
        return <h2 {...props.attributes}>{props.children}</h2>
      case 'heading3':
        return <h3 {...props.attributes}>{props.children}</h3>
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])

  return (
    <>
      <div style={{ display: 'flex' }}>
        <FileExplorer initialPath={"/Users/sidharthkanchiraju/Downloads"} onFileClick={handleFileClick} />
        <div style={{ flex: 1, padding: '20px' }}>
          <Slate editor={editor} initialValue={initialValue}
            onChange={value => {
              const isAstChange = editor.operations.some(
                op => 'set_selection' !== op.type
              )
              if (isAstChange) {
                // Save the value to Local Storage.
                const content = JSON.stringify(value)
                localStorage.setItem('content', content)
              }
            }}
          >
            <div>
              <Toolbar editor={editor} />
            </div>
            <Editable
              editor={editor}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              style={{ padding: '15px', border: '1px solid #ccc', minHeight: '150px', margin: '10px', outline: 'none' }}
              onKeyDown={event => {

                if (event.shiftKey && event.key === 'Enter') {
                  event.preventDefault()
                  Transforms.insertNodes(
                    editor,
                    {
                      type: 'paragraph',
                      children: [{ text: '' }],
                    },
                  )
                }

                if (!event.ctrlKey) {
                  return
                }

                switch (event.key) {
                  case '`': {
                    event.preventDefault()
                    CustomEditor.toggleCodeBlock(editor)
                    break
                  }

                  case 'b': {
                    event.preventDefault()
                    CustomEditor.toggleBoldMark(editor)
                    break
                  }
                }
              }}
            />
          </Slate>
        </div>
      </div>

    </>
  )
}

export default App;