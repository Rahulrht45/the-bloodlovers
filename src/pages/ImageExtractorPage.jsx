import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Plus, Mic, Upload, Bot, User, Send } from 'lucide-react';
import './ImageExtractorPage.css';

const ImageExtractorPage = () => {
    // State
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [messages, setMessages] = useState([]); // Array of {role: 'user' | 'assistant', content: string}
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // 'idle', 'reading', 'done'
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Toggle Menu
    const toggleMenu = () => setMenuOpen(!menuOpen);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, status]);

    // Backend API Calls
    const uploadTextToMemory = async (text) => {
        try {
            const res = await fetch('http://localhost:3000/upload-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            console.log("Memory updated:", data);
        } catch (error) {
            console.error("Failed to upload text to memory:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Failed to connect to AI memory. Ensure backend is running." }]);
        }
    };

    const askAI = async (question) => {
        try {
            setIsThinking(true);
            const res = await fetch('http://localhost:3000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "I couldn't find an answer." }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error contacting AI." }]);
        } finally {
            setIsThinking(false);
        }
    };

    // OCR Logic
    const readImage = (file) => {
        if (!file) return;

        setStatus('reading');
        setProgress(0);
        setMenuOpen(false); // Close menu
        // Clear previous context if needed, or keep appending? Let's clear for this session to match "New Chat" feel
        // setMessages([]); 

        Tesseract.recognize(
            file,
            'eng',
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            }
        ).then(async ({ data: { text } }) => {
            const cleanText = text.trim();
            if (cleanText) {
                setMessages(prev => [...prev, { role: 'system', content: `📄 **Scanned Text**: \n\n${cleanText.substring(0, 300)}... (stored in memory)` }]);
                setStatus('done');
                await uploadTextToMemory(cleanText);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ No readable text found in image." }]);
                setStatus('done');
            }
        }).catch(err => {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error reading image. Please try again." }]);
            setStatus('done');
        });
    };

    // File Input Handler
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            readImage(file);
        }
    };

    // Drag & Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            readImage(file);
        }
    };

    // Chat Handler
    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        const question = inputText;
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setInputText('');

        askAI(question);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && !event.target.closest('.chat-input-container')) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <div className="image-extractor-page">
            <header className="header">
                <div className="logo">ChatGPT</div>
                <button className="plus-btn">Get Plus</button>
            </header>

            <main className="main">
                {messages.length === 0 && status !== 'reading' && <h1>What can I help with?</h1>}

                {/* Drop Zone (Only show if no messages and not reading, acting as placeholder) */}
                {messages.length === 0 && status !== 'reading' && (
                    <div
                        className={`drop-zone ${isDragOver ? 'drag-active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <p onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                            Drag & drop an image here to start
                        </p>
                    </div>
                )}

                {/* Reading Status */}
                {status === 'reading' && (
                    <div className="drop-zone" style={{ border: 'none' }}>
                        <p>🧠 Reading text from image... {progress}%</p>
                        <div style={{ marginTop: '10px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden', width: '300px', margin: '10px auto' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: '#6f5cff', transition: 'width 0.3s' }}></div>
                        </div>
                    </div>
                )}

                {/* Chat History */}
                <div className="response-container">
                    {messages.map((msg, index) => (
                        <div key={index} className="gpt-message" style={{ background: msg.role === 'user' ? 'transparent' : '#1a1a1a', border: msg.role === 'user' ? 'none' : '1px solid #333' }}>
                            <div className="gpt-icon" style={{ background: msg.role === 'user' ? '#5436DA' : '#19c37d' }}>
                                {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
                            </div>
                            <div className="gpt-text">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="gpt-message">
                            <div className="gpt-icon">
                                <Bot size={20} color="white" />
                            </div>
                            <div className="gpt-text">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Fixed at bottom or floating? ChatGPT keeps it sticky bottom. */}
                {/* For this simple layout, we'll keep it in flow but sticky */}
                <div className="chat-input-container" style={{ position: 'sticky', bottom: '20px', marginTop: 'auto', background: '#0f0f0f', padding: '10px 0' }}>
                    <div className="chat-input-bar">
                        <button className="icon-btn" onClick={toggleMenu} title="Add attachment">
                            <Plus size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Message ChatGPT..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        {inputText ? (
                            <button className="icon-btn" onClick={handleSendMessage} style={{ color: '#6f5cff' }}>
                                <Send size={20} />
                            </button>
                        ) : (
                            <button className="icon-btn" title="Voice Mode">
                                <Mic size={20} />
                            </button>
                        )}
                    </div>

                    {menuOpen && (
                        <div className="upload-menu" style={{ bottom: '80px' }}>
                            <label className="upload-menu-item">
                                <Upload size={18} />
                                <span>Upload image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ImageExtractorPage;
