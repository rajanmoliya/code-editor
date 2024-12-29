function EditorControls({ currentFile, saveFile, executeCode, isExecuting }) {
  return (
    <div className="bg-gray-700 text-white p-4 flex flex-wrap justify-between items-center">
      <div className="sm:truncate sm:text-base ml-8 sm:ml-0">
        {currentFile.name}
      </div>
      <div className="flex space-x-2 mt-2 sm:mt-0">
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(
            currentFile.content
          )}`}
          download={currentFile.name}
          className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600"
        >
          Download
        </a>
        <button
          className="bg-blue-500 px-4 py-1 rounded hover:bg-blue-600"
          onClick={saveFile}
        >
          Save
        </button>
        <button
          className={`px-4 py-1 rounded ${
            isExecuting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
          onClick={executeCode}
          disabled={isExecuting}
        >
          {isExecuting ? "Running..." : "Run"}
        </button>
      </div>
    </div>
  );
}

export default EditorControls;
