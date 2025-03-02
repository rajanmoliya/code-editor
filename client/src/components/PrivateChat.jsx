import { useState, useEffect, useRef } from "react";

const PrivateChat = ({ token, userId }) => {
  const [users, setUsers] = useState([]); // Online users
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages =
      JSON.parse(localStorage.getItem("chatMessages")) || {};
    setMessages(storedMessages);
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(
      `${import.meta.env.VITE_BACKEND_WS_URL}?token=${token}`
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "online_users") {
        setUsers(data.users.filter((user) => user.id !== userId));
      }

      if (data.type === "private_chat") {
        setMessages((prev) => {
          const updatedMessages = {
            ...prev,
            [data.senderId]: [
              ...(prev[data.senderId] || []),
              { senderId: data.senderId, text: data.message },
            ],
          };
          localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
          return updatedMessages;
        });

        if (data.senderId !== selectedUser?.id) {
          setUnreadMessages((prev) => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1,
          }));
        }
      }
    };

    return () => ws.current.close();
  }, [token, userId, selectedUser]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      const msgData = { senderId: userId, text: message };
      ws.current.send(
        JSON.stringify({
          type: "private_chat",
          recipientId: selectedUser.id,
          message,
        })
      );

      setMessages((prev) => {
        const updatedMessages = {
          ...prev,
          [selectedUser.id]: [...(prev[selectedUser.id] || []), msgData],
        };
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      setMessage("");
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[user.id];
      return updated;
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col md:flex-row h-[500px] bg-gray-100">
      {/* Sidebar for Online Users */}
      <div className="w-full md:w-1/4 bg-white p-4 border-r border-gray-300">
        <h3 className="text-sm font-bold mb-2 text-gray-800">Online Users</h3>
        {users.length === 0 ? (
          <p className="text-gray-600">No users online</p>
        ) : (
          users.map((user) => (
            <button
              key={user.id}
              className={`flex justify-between items-center w-full p-2 rounded-lg text-center  transition ${
                selectedUser?.id === user.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => selectUser(user)}
            >
              <span>{user.username}</span>
              {unreadMessages[user.id] && (
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-white ">
        {selectedUser ? (
          <>
            <div className="border-b pb-2 px-4 py-2 text-lg font-semibold flex justify-between sticky top-0  shadow-sm">
              Chat with &apos;{selectedUser.username}&apos;
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 border">
              {(messages[selectedUser.id] || []).map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 my-1 px-3 w-max ${
                    msg.senderId === userId
                      ? "bg-blue-500 text-white self-end ml-auto rounded-lg"
                      : "bg-gray-200 text-gray-800 self-start rounded-lg"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center p-2 border-t bg-white sticky bottom-0">
              <form onSubmit={sendMessage} className="w-full flex">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-l-md focus:outline-none resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  autoFocus
                />
                <button
                  className="px-4 py-2 bg-green-700 text-white rounded-r-md hover:bg-green-800"
                  // onClick={sendMessage}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <p className="text-gray-600 text-center my-auto p-4">
            Select a user to start chatting
          </p>
        )}
      </div>
    </div>
  );
};

export default PrivateChat;
