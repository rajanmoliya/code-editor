import { FaJs, FaPython, FaRust } from "react-icons/fa";
import {
  SiCplusplus,
  SiGo,
  SiRuby,
  SiR,
  SiHaskell,
  SiPhp,
} from "react-icons/si";

function Modal({
  setShowModal,
  newFileName,
  setNewFileName,
  newFileType,
  setNewFileType,
  createFile,
}) {
  const languageOptions = [
    {
      value: "python",
      label: "Python",
      icon: <FaPython className="w-4 h-4" />,
    },
    {
      value: "javascript",
      label: "JavaScript",
      icon: <FaJs className="w-4 h-4" />,
    },
    { value: "cpp", label: "C++", icon: <SiCplusplus className="w-4 h-4" /> },
    // { value: "go", label: "Go", icon: <SiGo className="w-4 h-4" /> },
    { value: "php", label: "PHP", icon: <SiPhp className="w-4 h-4" /> },
    { value: "rust", label: "Rust", icon: <FaRust className="w-4 h-4" /> },
    { value: "ruby", label: "Ruby", icon: <SiRuby className="w-4 h-4" /> },
    { value: "r", label: "R", icon: <SiR className="w-4 h-4" /> },
    {
      value: "haskell",
      label: "Haskell",
      icon: <SiHaskell className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-96">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Create New File
        </h3>

        {/* File Name Input */}
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6"
          placeholder="File Name"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          autoFocus
        />

        {/* Language Selection Capsules (Horizontal) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {languageOptions.map((lang) => (
            <button
              key={lang.value}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                newFileType === lang.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
              }`}
              onClick={() => setNewFileType(lang.value)}
            >
              <span>{lang.icon}</span>
              <span className="text-sm">{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
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
