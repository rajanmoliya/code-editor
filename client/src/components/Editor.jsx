import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, Zoom } from "react-toastify";

import Sidebar from "./Sidebar";
import MonacoEditorWrapper from "./MonacoEditorWrapper";
import EditorControls from "./EditorControls";
import Output from "./Output";
import Modal from "./Modal";

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

  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  // Modified useEffect to select the latest file after fetching
  useEffect(() => {
    fetchFiles();
  }, []);

  // New useEffect to handle selecting the latest file
  useEffect(() => {
    if (files.length > 0 && !currentFile) {
      const latestFile = files[files.length - 1];
      setCurrentFile(latestFile);
    }
  }, [files]);

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
      rust: "rs",
      java: "java",
      kotlin: "kt",
      go: "go",
      haskell: "hs",
    };
    const fileExtension = fileExtensionMap[newFileType];
    const fullName = `${newFileName}.${fileExtension}`;

    try {
      const response = await api.post("/files", {
        name: fullName,
        language: newFileType,
        content: "",
      });
      const newFile = response.data;
      setFiles([...files, newFile]);
      setCurrentFile(newFile); // Automatically select the new file
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
      const response = await api.put(`/files?id=${currentFile._id}`, {
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
      await api.delete(`/files?id=${fileId}`);
      setFiles(files.filter((f) => f._id !== fileId));
      if (currentFile?._id === fileId) {
        const remainingFiles = files.filter((f) => f._id !== fileId);
        setCurrentFile(
          remainingFiles.length > 0
            ? remainingFiles[remainingFiles.length - 1]
            : null
        );
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
      const errorMessage = error.response?.data?.error || error.message;
      setOutput(errorMessage);
      toast.error("Execution failed", {
        position: "top-center",
        autoClose: 1500,
        theme: "colored",
        transition: Zoom,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        user={user}
        files={files}
        setFiles={setFiles}
        currentFile={currentFile}
        setCurrentFile={setCurrentFile}
        logout={logout}
        navigate={navigate}
        setShowModal={setShowModal}
        deleteFile={deleteFile}
      />
      <div className="flex-1 flex flex-col">
        {currentFile ? (
          <>
            <EditorControls
              currentFile={currentFile}
              saveFile={saveFile}
              executeCode={executeCode}
              isExecuting={isExecuting}
            />
            <MonacoEditorWrapper
              currentFile={currentFile}
              setCurrentFile={setCurrentFile}
            />
            <Output output={output} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <p className="text-lg">Select or Create a file to start coding</p>
            <p>
              <button
                className="px-4 py-2 mt-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => setShowModal(true)}
              >
                Create New File
              </button>
            </p>
          </div>
        )}
      </div>
      {showModal && (
        <Modal
          setShowModal={setShowModal}
          newFileName={newFileName}
          setNewFileName={setNewFileName}
          newFileType={newFileType}
          setNewFileType={setNewFileType}
          createFile={createFile}
        />
      )}
    </div>
  );
}

export default Editor;
