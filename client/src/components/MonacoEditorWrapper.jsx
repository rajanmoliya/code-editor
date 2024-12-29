import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

function MonacoEditorWrapper({ currentFile, setCurrentFile }) {
  const editorRef = useRef(null);

  // This useEffect will handle focusing the editor when currentFile changes
  useEffect(() => {
    if (editorRef.current && currentFile) {
      // Focus the editor
      editorRef.current.focus();
    }
  }, [currentFile]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Focus editor immediately after mounting
    editor.focus();
  };

  const handleEditorChange = (value) => {
    setCurrentFile({ ...currentFile, content: value });
  };

  return (
    <div className="flex-1">
      <Editor
        height="100%"
        theme="vs-dark"
        path={currentFile?.name}
        defaultLanguage={currentFile?.language}
        value={currentFile?.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}

export default MonacoEditorWrapper;
