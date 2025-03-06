import { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";

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
    if (!message.trim() || !selectedUser) return; // Prevent sending empty messages

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
    <div className="flex flex-col md:flex-row h-[500px] bg-gray-50 shadow-md rounded-md overflow-hidden">
      {/* Sidebar for Online Users */}
      <UserList
        users={users}
        selectedUser={selectedUser}
        selectUser={selectUser}
        unreadMessages={unreadMessages}
      />

      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="border-b pb-2 px-4 py-3 text-lg font-semibold flex justify-between bg-gray-200">
              Chat with &apos;{selectedUser.username}&apos;
            </div>

            {/* Messages Container */}
            <ChatMessages
              messages={messages[selectedUser.id] || []}
              userId={userId}
              messagesEndRef={messagesEndRef}
            />

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center p-2 border-t bg-white sticky bottom-0"
            >
              <input
                type="text"
                className="flex-1 p-2 border rounded-l-md focus:outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                required
              />
              <button className="px-4 py-2 bg-green-700 text-white rounded-r-md hover:bg-green-800 flex items-center">
                <FaPaperPlane className="w-4 h-4 mr-1" /> Send
              </button>
            </form>
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

/* ✅ Online Users Sidebar */
const UserList = ({ users, selectedUser, selectUser, unreadMessages }) => (
  <div className="w-full md:w-1/4 bg-white p-4 border-r border-gray-300">
    <h3 className="text-sm font-bold mb-2 text-gray-800">Online Users</h3>
    {users.length === 0 ? (
      <p className="text-gray-600">No users online</p>
    ) : (
      users.map((user) => (
        <button
          key={user.id}
          className={`flex justify-between items-center w-full p-2 rounded-lg text-left transition ${
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
);

/* ✅ Chat Messages Component */
const ChatMessages = ({ messages, userId, messagesEndRef }) => (
  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 border">
    {messages.length === 0 ? (
      <p className="text-gray-500 text-center">No messages yet</p>
    ) : (
      messages.map((msg, index) => (
        <div
          key={index}
          className={`p-2 my-1 px-3 w-max ${
            msg.senderId === userId
              ? "bg-blue-500 text-white ml-auto rounded-lg"
              : "bg-gray-200 text-gray-800 rounded-lg"
          }`}
        >
          {msg.text}
        </div>
      ))
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default PrivateChat;
