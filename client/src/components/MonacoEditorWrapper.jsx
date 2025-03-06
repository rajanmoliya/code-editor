import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

function MonacoEditorWrapper({ currentFile, setCurrentFile }) {
  const editorRef = useRef(null);

  // Focus editor when file changes
  useEffect(() => {
    if (editorRef.current && currentFile) {
      editorRef.current.focus();
    }
  }, [currentFile]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value) => {
    setCurrentFile((prev) => ({ ...prev, content: value }));
  };

  return (
    <div className="flex-1 h-full w-full flex flex-col">
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        path={currentFile?.name}
        defaultLanguage={currentFile?.language}
        value={currentFile?.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 17,
          wordWrap: "on",
          formatOnPaste: true,
          smoothScrolling: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,

          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}

export default MonacoEditorWrapper;
