// Import React dependencies.
import React, { useState, useCallback, useMemo } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'

// Import the `Editor` and `Transforms` helpers from Slate.
import { Editor, Transforms, Element, Node } from 'slate'
// Store the file path globally or in state
let scriptPath = null;

async function saveScript(text) {
  if (typeof window.api !== 'undefined') {
    try {
      const result = await window.api.saveFile("script.py", text);
      if (result.success) {
        scriptPath = result.path; // Store the path!
        console.log("Saved to:", scriptPath)
        return result.path;
      } else {
        console.error("Save failed:", result.error)
        return null;
      }
    } catch (error) {
      console.error("Error saving:", error)
      return null;
    }
  } else {
    console.error("window.api is not available!")
    return null;
  }
}

async function run() {
  if (typeof window.api !== 'undefined') {
    try {
      // Use the saved path, or show error if file wasn't saved
      if (!scriptPath) {
        console.error("No script path available. Did you save the file?");
        return;
      }
      
      // Use absolute path with quotes to handle spaces
      const command = `python3 "${scriptPath}"`;
      console.log("Executing:", command);
      
      const result = await window.api.runCommand(command);
      if (result.success) {
        console.log("Output:", result.stdout);
      } else {
        console.error("Error:", result.stderr)
      }
    } catch (error) {
      console.error("Error running:", error)
    }
  } else {
    console.error("window.api is not available!")
  }
}

// Combined function that ensures save completes before run
async function saveAndRun(text) {
  const path = await saveScript(text);
  if (path) {
    await run();
  } else {
    console.error("Failed to save, cannot run");
  }
}

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.bold === true : false
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    })

    return !!match
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
    )
  },
}

const withCodeBlocks = (editor) => {
  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    if (selection) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === 'code',
      })

      if (match) {
        // Insert a newline character instead of creating a new node
        editor.insertText('\n')
        return
      }
    }

    // Default behavior for non-code blocks
    insertBreak()
  }

  return editor
}

const App = () => {
  const [editor] = useState(() => withCodeBlocks(withReact(createEditor())))

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
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])

  return (
    // Add a toolbar with buttons that call the same methods.
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
        <button
          style={{ margin: '10px' }}
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleBoldMark(editor)
          }}
        >
          Bold
        </button>
        <button
          style={{ margin: '10px' }}
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleCodeBlock(editor)
          }}
        >
          Code Block
        </button>
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
  )
}

const CodeElement = props => {

  const getText = () => {
    // Get the text content of the entire element
    return Node.string(props.element)
  }

  return (
    <pre {...props.attributes} style={{ backgroundColor: '#f0f0f0', paddingBottom: '20px' }}>
      <div
        contentEditable={false}  // Important: prevent editing issues
        style={{
          height: '40px',
          marginBottom: '10px',
          padding: '5px 15px',
          backgroundColor: '#e0e0e0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          // border: '1px solid #ccc',
        }}>
        <div style={{ position: 'absolute', left: '35px', top: '45px', color: '#888' }}>
          Code Block
        </div>
        <button
          contentEditable={false}  // Important: prevent editing issues
          style={{
            position: 'absolute',
            right: '30px',
            top: '40px',
            padding: '5px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onMouseDown={event => {
            event.preventDefault()  // Prevent focus issues
            const text = getText();
            saveAndRun(text) // This ensures save completes before run
          }}
        >
          Run
        </button>
        {/* <div style={{ top: '60px' }}>
          <hr style={{ marginTop: '40px', marginBottom: '10px' }} />
        </div> */}
      </div>
      <code style={{ margin: '10px 10px', padding: "10px" }}>{props.children}</code>
    </pre>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}

// Define a React component to render leaves with bold text.
const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}

export default App;