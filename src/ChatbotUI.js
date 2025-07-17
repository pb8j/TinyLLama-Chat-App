import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './ChatbotUI.module.css';

// Mock NLP and data files
const productData = {
    products: [
        { id: 1, name: "Autonomous Drone", description: "A state-of-the-art autonomous drone for aerial surveillance and data collection.", price: 2500, features: ["4K Camera", "30-minute flight time", "Obstacle avoidance"] },
        { id: 2, name: "Robotic Arm", description: "A high-precision robotic arm for manufacturing and assembly lines.", price: 5000, features: ["6-axis movement", "2kg payload capacity", "Easy-to-use software interface"] },
        { id: 3, name: "AI Vision System", description: "An AI-powered vision system for quality control and object recognition.", price: 3200, features: ["High-speed image processing", "Deep learning models", "Integration with existing systems"] }
    ]
};
const companyInfo = { name: "AI Robotics Corp", mission: "To advance the future of automation and artificial intelligence.", contact: "contact@airobotics.com" };

const processQuery = async (query) => {
    const lowerCaseQuery = query.toLowerCase();
    await new Promise(resolve => setTimeout(resolve, 500));
    if (lowerCaseQuery.includes('hello') || lowerCaseQuery.includes('hi')) return "Hello! I am the AI Robotics Assistant. How can I help you today?";
    if (lowerCaseQuery.includes('company') && lowerCaseQuery.includes('name')) return `Our company is called ${companyInfo.name}.`;
    if (lowerCaseQuery.includes('mission') || lowerCaseQuery.includes('about')) return companyInfo.mission;
    if (lowerCaseQuery.includes('contact') || lowerCaseQuery.includes('email')) return `You can contact us at: ${companyInfo.contact}.`;
    if (lowerCaseQuery.includes('products') || lowerCaseQuery.includes('list')) {
        const productNames = productData.products.map(p => p.name).join(', ');
        return `We offer: ${productNames}. Which one interests you?`;
    }
    const foundProduct = productData.products.find(p => lowerCaseQuery.includes(p.name.toLowerCase()));
    if (foundProduct) {
        if (lowerCaseQuery.includes('price')) return `The price of the ${foundProduct.name} is $${foundProduct.price}.`;
        if (lowerCaseQuery.includes('description')) return foundProduct.description;
        return `The ${foundProduct.name} features: ${foundProduct.features.join(', ')}. What else would you like to know?`;
    }
    return "I'm sorry, I don't have information on that. Please ask about our products or company.";
};

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
        const botResponse = await processQuery(input);
        setIsTyping(false);
        const botMessage = { text: botResponse, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
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