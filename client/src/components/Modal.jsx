import { FaJs, FaPython, FaRust } from "react-icons/fa";
import { SiCplusplus, SiPhp, SiRuby, SiR, SiHaskell } from "react-icons/si";
import { IoClose } from "react-icons/io5"; // Close Icon

function Modal({
  setShowModal,
  newFileName,
  setNewFileName,
  newFileType,
  setNewFileType,
  createFile,
  isCreatingFile,
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-40">
      <div className="bg-white p-5 rounded-lg shadow-xl w-11/12 sm:w-96 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-all"
          onClick={() => {
            setShowModal(false);
            setNewFileName("");
          }}
        >
          <IoClose className="w-6 h-6" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-800 text-center mb-4">
          Create a New File
        </h3>

        {/* File Name Input + Create Button */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder="Enter file name..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            autoFocus
            required
          />
          <button
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              newFileName.trim()
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={createFile}
            disabled={!newFileName.trim()} // Disable if input is empty
          >
            {isCreatingFile ? "Creating..." : "Create"}
          </button>
        </div>

        {/* Language Selection Capsules */}
        <div className="grid grid-cols-3 gap-2">
          {languageOptions.map((lang) => (
            <button
              key={lang.value}
              className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded-md border transition-all text-sm ${
                newFileType === lang.value
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onClick={() => setNewFileType(lang.value)}
            >
              {lang.icon}
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Modal;
