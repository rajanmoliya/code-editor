function Modal({
  setShowModal,
  newFileName,
  setNewFileName,
  newFileType,
  setNewFileType,
  createFile,
}) {
  const languageOptions = [
    { value: "javascript", label: ".js" },
    { value: "python", label: ".py" },
    { value: "cpp", label: ".cpp" },
    { value: "rust", label: ".rs" },
    { value: "java", label: ".java" },
    { value: "kotlin", label: ".kt" },
    { value: "go", label: ".go" },
    { value: "haskell", label: ".hs" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-96">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Create New File
        </h3>
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="File Name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            autoFocus
          />
          <select
            className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={newFileType}
            onChange={(e) => setNewFileType(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={createFile}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
