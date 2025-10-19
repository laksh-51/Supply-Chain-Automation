// frontend/src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

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
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {/* Chat Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00BCD4', 
          color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{ 
          width: '300px', height: '400px', backgroundColor: 'white', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '8px', 
          position: 'absolute', bottom: '70px', right: '0', 
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '10px', backgroundColor: '#00BCD4', color: 'white', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
            Supply Chain Assistant
          </div>
          
          {/* Messages Display */}
          <div style={{ flexGrow: 1, padding: '10px', overflowY: 'auto', borderBottom: '1px solid #ddd' }}>
            {messages.length === 0 && <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9em' }}>How can I help you today?</p>}
            {messages.map((msg, index) => (
              <div key={index} style={{ 
                marginBottom: '8px', 
                textAlign: msg.sender === 'user' ? 'right' : 'left'
              }}>
                <span style={{ 
                  display: 'inline-block', padding: '8px', borderRadius: '12px', 
                  backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0'
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSend} style={{ padding: '10px', display: 'flex' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..."
              style={{ flexGrow: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px 0 0 4px' }}
            />
            <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#00BCD4', color: 'white', border: 'none', borderRadius: '0 4px 4px 0' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;