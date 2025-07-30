import React, { useState, useEffect, useRef } from "react";
import useAuthStore from "../../stores/authStore";
import { chatService } from "../../utils/chatService";

const ChatWindow = ({ budgetId }) => {
  const { currentUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!budgetId) return undefined;
    const unsub = chatService.subscribe(budgetId, setMessages);
    return () => unsub();
  }, [budgetId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await chatService.sendMessage(budgetId, {
      userId: currentUser?.userId,
      userName: currentUser?.userName,
      text: text.trim(),
    });
    setText("");
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{msg.userName || "Anon"}</strong>: {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="input-area">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;
