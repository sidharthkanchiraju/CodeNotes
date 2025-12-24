// imports from 'slate' and 'slate-react'
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

  isItalicMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.italic === true : false
  },

  isStrikethroughMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.strikethrough === true : false
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

  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'italic')
    } else {
      Editor.addMark(editor, 'italic', true)
    }
  },

  toggleStrikeMark(editor) {
    const isActive = CustomEditor.isStrikethroughMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'strikethrough')
    } else {
      Editor.addMark(editor, 'strikethrough', true)
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
          display: 'flex',                    // Add this
          alignItems: 'center',               // Add this
          justifyContent: 'space-between',
          height: '40px',
          marginBottom: '10px',
          padding: '10px 15px',
          backgroundColor: '#e0e0e0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          // border: '1px solid #ccc',
        }}>
        <div style={{ color: '#888' }}>
          Code Block
        </div>
        <button
          contentEditable={false}  // Important: prevent editing issues
          style={{
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
      <code style={{
        display: 'block',           // Make it a block element
        margin: '0 10px',          // Horizontal margins
        padding: '10px',           // Padding inside
        whiteSpace: 'pre-wrap'     // Preserve whitespace and line breaks
      }}>
        {props.children}
      </code>
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

export { CustomEditor, withCodeBlocks, CodeElement, DefaultElement, Leaf }