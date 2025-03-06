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
import PrivateChat from "./PrivateChat";

import { FiMessageCircle, FiX } from "react-icons/fi"; // Import icons
import SubscriptionModal from "./SubscriptionModal ";

function Editor() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("javascript");

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);

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
    const maxFileLimit = user?.user.subscription?.maxFiles || 3;

    if (files.length >= maxFileLimit) {
      // Open subscription modal if limit reached
      setIsSubscriptionModalOpen(true);
      return;
    }
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
      php: "php",
      ruby: "rb",
      go: "go",
      r: "r",
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
      toast.error(`Error creating file: ${error.message}`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
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
      toast.error(`Error saving file: ${error.message}`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
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
      toast.error(`Error deleting file: ${error.message}`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };

  // Full implementation of updateFile function
  const updateFile = async (fileId, updates) => {
    try {
      // First make the API call to update the file
      const response = await api.put(`/files?id=${fileId}`, updates);

      // Update the files array with the updated file
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file._id === fileId ? { ...file, ...updates } : file
        )
      );

      // If the current file is the one being updated, update that as well
      if (currentFile && currentFile._id === fileId) {
        setCurrentFile((prevFile) => ({ ...prevFile, ...updates }));
      }

      toast.success("File updated successfully", {
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

      return response.data;
    } catch (error) {
      toast.error(`Error updating file: ${error.message}`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      throw error;
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
    <div className="h-screen flex bg-gray-100 relative">
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
        updateFile={updateFile}
      />
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onUpgrade={() => {
          setIsSubscriptionModalOpen(false);
        }}
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
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-700 text-center p-6 ">
            <p className="text-xl font-semibold text-gray-100">
              Create a file to start coding 🚀
            </p>
            <button
              className="px-5 py-2.5 mt-4 bg-green-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
              onClick={() => setShowModal(true)}
            >
              + Create New File
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition flex"
      >
        <FiMessageCircle size={28} />
      </button>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="fixed bottom-16 right-4 w-[520px] bg-white shadow-lg rounded-lg ">
          <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-lg">
            <span>Private Chat</span>
            <button onClick={() => setIsChatOpen(false)}>
              <FiX size={20} />
            </button>
          </div>
          <div className="h-[500px] overflow-y-auto">
            <PrivateChat token={token} userId={user.user._id} />
          </div>
        </div>
      )}
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
