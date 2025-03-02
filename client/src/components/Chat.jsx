import { useState, useEffect, useRef } from "react";

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(
      `${import.meta.env.VITE_BACKEND_WS_URL}?token=${token}`
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          { sender: data.sender, text: data.message },
        ]);
      }
    };

    return () => ws.current.close();
  }, [token]);

  const sendMessage = () => {
    if (message.trim()) {
      ws.current.send(JSON.stringify({ type: "chat", message }));
      setMessage("");
    }
  };

  return (
    <div className="chat-container p-4 bg-gray-900 text-white h-64 overflow-y-auto">
      <div className="messages space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 bg-gray-800 rounded-md">
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          className="w-full p-2 text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="ml-2 p-2 bg-blue-500" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
