import { MdDelete } from "react-icons/md";
import {
  SiPython,
  SiJavascript,
  SiCplusplus,
  SiKotlin,
  SiGoland,
  SiHaskell,
  SiRust,
  SiRuby,
  SiR,
} from "react-icons/si";
import { FaJava, FaPhp } from "react-icons/fa";
import UserProfile from "./UserProfile";
import { useState, useEffect, useRef } from "react";

function Sidebar({
  user,
  files,
  setFiles,
  currentFile,
  setCurrentFile,
  logout,
  setShowModal,
  deleteFile,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);

  const fileTypeIconMap = {
    javascript: <SiJavascript className="text-yellow-400" />,
    python: <SiPython className="text-blue-400" />,
    cpp: <SiCplusplus className="text-green-400" />,
    rust: <SiRust className="text-red-400" />,
    php: <FaPhp className="text-blue-400" />,
    ruby: <SiRuby className="text-red-400" />,
    r: <SiR className="text-blue-400" />,
    go: <SiGoland className="text-blue-400" />,
    haskell: <SiHaskell className="text-blue-400" />,
  };

  // Close sidebar when clicking outside
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

  return (
    <>
      {/* Hamburger Menu */}
      <button
        className="absolute top-4 left-2 sm:hidden bg-gray-800 text-white p-2 rounded"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed sm:relative ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 transition-transform duration-300 z-40 w-64 bg-gray-800 text-white flex flex-col h-full`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Profile at Bottom */}
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
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    currentFile?._id === file._id
                      ? "bg-gray-700"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    setCurrentFile(file);
                    setIsSidebarOpen(false); // Close sidebar
                  }}
                >
                  <span className="mr-2">{fileTypeIconMap[file.language]}</span>
                  <span className="truncate w-10/12">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent click
                      deleteFile(file._id);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <UserProfile user={user} filesCount={files.length} logout={logout} />
        </div>
      </div>
    </>
  );
}

export default Sidebar;
