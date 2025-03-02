import { useState, useEffect, useRef } from "react";
import {
  SiPython,
  SiJavascript,
  SiCplusplus,
  SiGoland,
  SiHaskell,
  SiRust,
  SiRuby,
  SiR,
  SiPhp,
} from "react-icons/si";
import UserProfile from "./UserProfile";
import { FaSave, FaTimes } from "react-icons/fa";

function Sidebar({
  user,
  files,
  setFiles,
  currentFile,
  setCurrentFile,
  logout,
  setShowModal,
  deleteFile,
  updateFile,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const sidebarRef = useRef(null);
  const editInputRef = useRef(null);

  const supportedLanguages = [
    {
      value: "javascript",
      label: "JavaScript",
      icon: <SiJavascript className="text-yellow-400" />,
    },
    {
      value: "python",
      label: "Python",
      icon: <SiPython className="text-blue-400" />,
    },
    {
      value: "cpp",
      label: "C++",
      icon: <SiCplusplus className="text-blue-400" />,
    },
    { value: "rust", label: "Rust", icon: <SiRust className="text-red-400" /> },
    { value: "php", label: "PHP", icon: <SiPhp className="text-blue-400" /> },
    { value: "ruby", label: "Ruby", icon: <SiRuby className="text-red-400" /> },
    { value: "r", label: "R", icon: <SiR className="text-blue-400" /> },
    { value: "go", label: "Go", icon: <SiGoland className="text-blue-400" /> },
    {
      value: "haskell",
      label: "Haskell",
      icon: <SiHaskell className="text-blue-400" />,
    },
  ];

  const fileTypeIconMap = {
    javascript: <SiJavascript className="text-yellow-400" />,
    python: <SiPython className="text-blue-400" />,
    cpp: <SiCplusplus className="text-blue-400" />,
    rust: <SiRust className="text-red-400" />,
    php: <SiPhp className="text-blue-400" />,
    ruby: <SiRuby className="text-red-400" />,
    r: <SiR className="text-blue-400" />,
    go: <SiGoland className="text-blue-400" />,
    haskell: <SiHaskell className="text-blue-400" />,
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (editingFileId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingFileId]);

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    const sidebarRect = sidebarRef.current.getBoundingClientRect();

    setContextMenu({
      x: e.clientX - sidebarRect.left,
      y: e.clientY - sidebarRect.top,
      file: file,
    });
  };

  const startEditing = (file) => {
    setEditingFileId(file._id);
    setEditName(file.name.split(".")[0]);
    setEditLanguage(file.language);
  };

  const cancelEditing = () => {
    setEditingFileId(null);
  };

  const saveFileChanges = () => {
    if (editName.trim() === "") return;

    const fileExtensionMap = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
      rust: "rs",
      php: "php",
      ruby: "rb",
      go: "go",
      r: "r",
      haskell: "hs",
    };

    const fileExtension = fileExtensionMap[editLanguage];
    const fullName = `${editName}.${fileExtension}`;

    updateFile(editingFileId, {
      name: fullName,
      language: editLanguage,
    });

    setEditingFileId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveFileChanges();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  return (
    <>
      <button
        className="absolute top-4 left-2 sm:hidden bg-gray-800 text-white p-2 rounded"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        ref={sidebarRef}
        className={`fixed sm:relative ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 transition-transform duration-300 z-40 w-64 bg-gray-800 text-white flex flex-col h-full`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">My Files</span>
              <button
                className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                onClick={() => setShowModal(true)}
              >
                + New
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[80vh]">
              {files.map((file) => (
                <div
                  key={file._id}
                  className={`p-2 rounded ${
                    currentFile?._id === file._id
                      ? "bg-gray-700"
                      : "hover:bg-gray-700"
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  {editingFileId === file._id ? (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="bg-gray-900 text-white p-1 rounded w-full"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <select
                          value={editLanguage}
                          onChange={(e) => setEditLanguage(e.target.value)}
                          className="bg-gray-900 text-white p-1 rounded text-sm w-24"
                        >
                          {supportedLanguages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex space-x-1">
                          <button
                            onClick={saveFileChanges}
                            className="text-green-400 hover:text-green-300 p-1"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-400 hover:text-gray-300 p-1"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        if (editingFileId === null) {
                          setCurrentFile(file);
                          setIsSidebarOpen(false);
                        }
                      }}
                    >
                      <span className="mr-2">
                        {fileTypeIconMap[file.language]}
                      </span>
                      <span className="truncate">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {contextMenu && (
            <div
              className="absolute bg-gray-700 shadow-lg rounded py-1 z-50 w-32"
              style={{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
              }}
            >
              <button
                className="w-full text-left px-2 py-1 hover:bg-gray-600"
                onClick={() => {
                  startEditing(contextMenu.file);
                  setContextMenu(null);
                }}
              >
                <span>✏️</span> Rename
              </button>
              <button
                className="w-full text-left px-2 py-1 hover:bg-gray-600 text-red-400"
                onClick={() => {
                  deleteFile(contextMenu.file._id);
                  setContextMenu(null);
                }}
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          )}

          <UserProfile user={user} filesCount={files.length} logout={logout} />
        </div>
      </div>
    </>
  );
}

export default Sidebar;
