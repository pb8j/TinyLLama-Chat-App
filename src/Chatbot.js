import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { processQuery } from './nlp';

const Chatbot = () => {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const messagesEndRef = useRef(null);

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
scrollToBottom();
}, [messages]);

const handleSend = async () => {
if (input.trim() === '') return;

const userMessage = { text: input, sender: 'user' };
setMessages((prevMessages) => [...prevMessages, userMessage]);

const botResponse = await processQuery(input);
const botMessage = { text: botResponse, sender: 'bot' };
setMessages((prevMessages) => [...prevMessages, botMessage]);

setInput('');
};

const handleInputChange = (e) => {
setInput(e.target.value);
};

const handleKeyPress = (e) => {
if (e.key === 'Enter') {
    handleSend();
}
};

return (
<div className="chatbot-container">
    <div className="chatbot-header">
    <h2>AI Robotics Chatbot</h2>
    </div>
    <div className="chatbot-messages">
    {messages.map((message, index) => (
        <div key={index} className={`message ${message.sender}`}>
        {message.text}
        </div>
    ))}
    <div ref={messagesEndRef} />
    </div>
    <div className="chatbot-input">
    <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Ask me about AI, Robotics, or our products..."
    />
    <button onClick={handleSend}>Send</button>
    </div>
</div>
);
};

export default Chatbot;