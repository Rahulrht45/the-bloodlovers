import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Plus, Mic, Upload, Bot, User, Send, Zap, BarChart3, MessageSquare } from 'lucide-react';
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
    const [extractionMode, setExtractionMode] = useState('auto'); // 'auto', 'stats', 'chat'

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
        } catch (error) {
            console.error("Failed to upload text to memory:", error);
            // Non-critical if chat is not used immediately
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
            setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "I couldn't find an answer in the provided context." }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error contacting AI Backend (Port 3000). Ensure Node server is running." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const runPythonScan = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                const players = result.data.players;
                let summary = `✅ **Statistical Scan Complete (Engine: FreeFireScanner)**\n\n`;
                summary += `**Map**: ${result.data.map} | **Mode**: ${result.data.match_type}\n\n`;

                players.forEach((p, i) => {
                    summary += `${i + 1}. **${p.name}** - Kills: ${p.kills} | Dmg: ${p.damage} | Surv: ${p.survival}\n`;
                });

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: summary + "\nStats have been synced to the global leaderboard."
                }]);
                return true;
            }
        } catch (error) {
            console.warn("Python scanner (Port 8000) not available, falling back to general OCR.");
        }
        return false;
    };

    // OCR Logic
    const readImage = async (file) => {
        if (!file) return;

        setStatus('reading');
        setProgress(0);
        setMenuOpen(false);

        // Try Python Stats Scanner First if in 'auto' or 'stats' mode
        if (extractionMode !== 'chat') {
            const pySuccess = await runPythonScan(file);
            if (pySuccess) {
                setStatus('done');
                return;
            }
        }

        // Fallback to Tesseract for General OCR / Chat
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
                setMessages(prev => [...prev, { role: 'assistant', content: `📄 **General OCR Complete**\n\nFound ${cleanText.split(' ').length} words. You can now ask questions about this document.` }]);
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

    // Handlers
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) readImage(file);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) readImage(file);
    };

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && !event.target.closest('.chat-input-container')) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <div className="image-extractor-page">
            <header className="header">
                <div className="logo">
                    <Zap size={20} className="text-[var(--neon-cyan)] mr-2" />
                    BLOODLOVERS <span className="text-[var(--neon-cyan)] italic ml-1">AI</span>
                </div>
                <div className="flex gap-4">
                    <button
                        className={`mode-btn ${extractionMode === 'auto' ? 'active' : ''}`}
                        onClick={() => setExtractionMode('auto')}
                    >
                        Auto
                    </button>
                    <button
                        className={`mode-btn ${extractionMode === 'stats' ? 'active' : ''}`}
                        onClick={() => setExtractionMode('stats')}
                        title="Focus on Match Stats (Python Engine)"
                    >
                        Stats
                    </button>
                </div>
            </header>

            <main className="main">
                {messages.length === 0 && status !== 'reading' && (
                    <div className="hero-text-container">
                        <h1>How can I help with your <span className="text-[var(--neon-cyan)] italic">Matches</span>?</h1>
                        <p className="subtitle">Upload screenshots to scan kills, analyze stats, or chat with match data.</p>
                    </div>
                )}

                {/* Drop Zone */}
                {messages.length === 0 && status !== 'reading' && (
                    <div
                        className={`drop-zone ${isDragOver ? 'drag-active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="drop-icon">
                            <Upload size={40} />
                        </div>
                        <p>Drag & drop or <span className="highlight">Browse Image</span></p>
                        <span className="hint">Supports Match Screenshots & Documents</span>
                    </div>
                )}

                {/* Status Bar */}
                {status === 'reading' && (
                    <div className="reading-container">
                        <div className="brain-animation">
                            <div className="pulse"></div>
                            <Bot size={48} className="text-[var(--neon-cyan)]" />
                        </div>
                        <p>🧠 Scanning with Neural Engine... {progress}%</p>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="response-container">
                    {messages.map((msg, index) => (
                        <div key={index} className={`gpt-message ${msg.role}`}>
                            <div className="gpt-icon">
                                {msg.role === 'user' ? <User size={18} /> : (msg.role === 'system' ? <BarChart3 size={18} /> : <Bot size={18} />)}
                            </div>
                            <div className="gpt-text">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="gpt-message assistant thinking">
                            <div className="gpt-icon"><Bot size={18} /></div>
                            <div className="gpt-text"><span className="animate-pulse">Analyzing context...</span></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-wrapper">
                    <div className="chat-input-container">
                        <div className="chat-input-bar">
                            <button className="icon-btn" onClick={toggleMenu} title="Upload Image">
                                <Plus size={20} />
                            </button>
                            <input
                                type="text"
                                placeholder="Analyze match stats or ask about scanned text..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {inputText ? (
                                <button className="icon-btn send-active" onClick={handleSendMessage}>
                                    <Send size={20} />
                                </button>
                            ) : (
                                <button className="icon-btn" title="Voice Assist">
                                    <Mic size={20} />
                                </button>
                            )}
                        </div>

                        {menuOpen && (
                            <div className="upload-menu">
                                <label className="upload-menu-item">
                                    <Upload size={18} className="text-[var(--neon-cyan)]" />
                                    <span>Upload Match Screen</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                </label>
                                <div className="upload-menu-item" onClick={() => setMessages([])}>
                                    <MessageSquare size={18} />
                                    <span>New Analysis</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImageExtractorPage;

