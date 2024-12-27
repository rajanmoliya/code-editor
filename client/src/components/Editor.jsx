import { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, Zoom } from "react-toastify";
import { SiPython, SiJavascript, SiCplusplus } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";

function Editor() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("javascript");

  const fileTypeIconMap = {
    javascript: <SiJavascript className="text-yellow-400" />,
    python: <SiPython className="text-blue-400" />,
    cpp: <SiCplusplus className="text-green-400" />,
  };

  const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const handleSave = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener("keydown", handleSave);
    return () => window.removeEventListener("keydown", handleSave);
  }, [currentFile]);

  useEffect(() => {
    const handleRun = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        executeCode();
      }
    };
    window.addEventListener("keydown", handleRun);
    return () => window.removeEventListener("keydown", handleRun);
  }, [currentFile]);

  // short cut for creating new file ctrl + n
  useEffect(() => {
    const handleNewFile = (e) => {
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        setShowModal(true);
      }
    };
    window.addEventListener("keydown", handleNewFile);
    return () => window.removeEventListener("keydown", handleNewFile);
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get("/files");
      setFiles(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
      }
    }
  };

  const createFile = async () => {
    if (!newFileName) {
      toast.error("File name is required", {
        position: "top-center",
        autoClose: 800,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Zoom,
      });
      return;
    }

    const fileExtensionMap = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
    };
    const fileExtension = fileExtensionMap[newFileType];
    const fullName = `${newFileName}.${fileExtension}`;

    try {
      const response = await api.post("/files", {
        name: fullName,
        language: newFileType,
        content: "",
      });
      setFiles([...files, response.data]);
      setShowModal(false);
      setNewFileName("");
      setNewFileType("javascript");
    } catch (error) {
      alert("Error creating file", error.message);
    }
  };

  const saveFile = async () => {
    if (!currentFile) return;

    try {
      const response = await api.put(`/files/${currentFile._id}`, {
        content: currentFile.content,
      });
      setFiles(
        files.map((f) => (f._id === response.data._id ? response.data : f))
      );
      toast.success("File saved successfully", {
        position: "top-center",
        autoClose: 700,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Zoom,
      });
    } catch (error) {
      alert("Error saving file", error.message);
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await api.delete(`/files/${fileId}`);
      setFiles(files.filter((f) => f._id !== fileId));
      if (currentFile?._id === fileId) {
        setCurrentFile(null);
      }
    } catch (error) {
      alert("Error deleting file", error.message);
    }
  };

  const executeCode = async () => {
    if (!currentFile) return;

    setIsExecuting(true);
    setOutput("Executing...");

    try {
      const response = await api.post("/execute", {
        code: currentFile.content,
        language: currentFile.language,
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(error.response?.data?.error || error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg">My Files</span>
            <button
              className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
              onClick={() => setShowModal(true)}
            >
              + New
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file._id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                  currentFile?._id === file._id
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setCurrentFile(file)}
              >
                <span className="flex items-center">
                  <span className="mr-2">{fileTypeIconMap[file.language]}</span>
                  {file.name}
                </span>
                <button
                  onClick={() => deleteFile(file._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <MdDelete />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full bg-red-500 px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentFile ? (
          <>
            {/* Editor Controls */}
            <div className="bg-gray-700 text-white p-4 flex justify-between items-center">
              <div>{currentFile.name}</div>
              <div className="space-x-2">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                    currentFile.content
                  )}`}
                  download={currentFile.name}
                  className="bg-gray-500 px-4 py-[9.5px] rounded hover:bg-gray-600 "
                >
                  <button>
                    <IoMdDownload />
                  </button>
                </a>
                <button
                  className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                  onClick={saveFile}
                >
                  Save
                </button>
                <button
                  className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                  onClick={executeCode}
                  disabled={isExecuting}
                >
                  {isExecuting ? "Running..." : "Run"}
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1">
              <MonacoEditor
                height="60vh"
                language={currentFile.language}
                value={currentFile.content}
                onChange={(value) =>
                  setCurrentFile({
                    ...currentFile,
                    content: value,
                  })
                }
                theme="vs-dark"
                options={{
                  fontSize: 16,
                  wordWrap: "on",
                }}
              />
            </div>

            {/* Output */}
            <div className="h-[30vh] bg-black text-white p-4 overflow-auto">
              <div className="font-bold mb-2">Output:</div>
              <pre>{output}</pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <p className="text-lg">Select or create a file to start coding</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
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
                <option value="javascript">.js</option>
                <option value="python">.py</option>
                <option value="cpp">.cpp</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                onClick={createFile}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Editor;
