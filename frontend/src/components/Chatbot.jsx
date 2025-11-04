// frontend/src/components/Chatbot.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Import local component CSS
import '../components/chatbot.css'; // <-- NEW IMPORT

const API_BASE_URL = "http://localhost:8000/api/v1";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('accessToken');
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!token) {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Please log in to use the chat service.' }]);
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/chatbot`, 
            { message: input },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const aiResponse = { sender: 'ai', text: response.data.response };
        setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
        console.error("Chatbot Error:", error);
        setMessages(prev => [...prev, { sender: 'ai', text: 'Error contacting the AI service.' }]);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="chat-toggle-button"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            Supply Chain Assistant
          </div>
          
          {/* Messages Display */}
          <div className="chat-messages-display">
            {messages.length === 0 && <p className="no-messages">How can I help you today?</p>}
            {messages.map((msg, index) => {
              const bubbleClass = msg.sender === 'user' ? 'user' : 'ai';
              return (
                <div key={index} className={`message-bubble ${bubbleClass}`}>
                  <span className="message-text">
                    {msg.text}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSend} className="chat-input-form">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..."
              className="chat-input"
            />
            <button type="submit" className="chat-send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;