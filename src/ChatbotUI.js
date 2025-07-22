import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './ChatbotUI.module.css';

// Remove mock data and the local processQuery function
// const productData = { ... };
// const companyInfo = { ... };
// const processQuery = async (query) => { ... };

const ChatbotUI = () => {
    const [messages, setMessages] = useState([{ text: "Welcome! Ask me about our AI, Robotics, and Automation systems.", sender: 'bot' }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Make an API call to your backend where the TinyLlama model is hosted
            const response = await fetch('http://localhost:5000/process-query', { // Replace with your actual backend API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userMessage.text }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.response; // Assuming your backend sends a JSON object with a 'response' field

            setIsTyping(false);
            const botMessage = { text: botResponse, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Error communicating with the chatbot API:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to my AI brain. Please try again later.", sender: 'bot' }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isTyping) handleSend();
    };

    return (
        <div className={styles.chatbotContainer}>
            <div className={styles.chatbotHeader}>
                <h2 className={styles.headerTitle}>AI Robotics Assistant</h2>
            </div>
            <div className={styles.messagesContainer}>
                {messages.map((message, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`${styles.messageWrapper} ${message.sender === 'user' ? styles.user : styles.bot}`}>
                        {message.sender === 'bot' && <div className={styles.botAvatar}></div>}
                        <div className={styles.messageBubble}><p>{message.text}</p></div>
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.messageWrapper} ${styles.bot}`}>
                        <div className={styles.botAvatar}></div>
                        <div className={styles.messageBubble}>
                            <div className={styles.typingIndicator}>
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className={styles.typingDot}></motion.div>
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} className={styles.typingDot}></motion.div>
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className={styles.typingDot}></motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." disabled={isTyping} className={styles.textInput} />
                    <button onClick={handleSend} disabled={isTyping} className={styles.sendButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotUI;