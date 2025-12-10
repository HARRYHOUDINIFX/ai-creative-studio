import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { MENU_OPTIONS, RESPONSES } from '../data/chatData';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

interface ChatWindowProps {
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: '안녕하세요! Visual Boost 입니다. \n궁금하신 내용을 아래 메뉴에서 선택해주세요.',
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Prevent background scrolling when chat is open (Robust Mobile Fix)
    useEffect(() => {
        // 1. Get current scroll position
        const scrollY = window.scrollY;

        // 2. Fix body position
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'scroll'; // Prevent layout shift if scrollbar disappears

        return () => {
            // 3. Restore scrolling
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflowY = '';

            // 4. Scroll back to original position
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        };
    }, []);

    const handleOptionClick = (optionId: number) => {
        const option = MENU_OPTIONS.find(o => o.id === optionId);
        if (!option) return;

        // User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: option.text,
            isBot: false,
            timestamp: new Date()
        };

        // Bot Response
        const botResponseText = RESPONSES[optionId];
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            isBot: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
    };

    return (
        <div className="fixed bottom-24 right-6 w-[360px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 ring-1 ring-gray-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Visual Boost 상담톡</h3>
                        <p className="text-xs text-slate-300">자동 응답 봇이 대기중입니다.</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            {msg.isBot && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-slate-600" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${msg.isBot
                                    ? 'bg-white text-slate-800 rounded-tl-none ring-1 ring-gray-100'
                                    : 'bg-primary-600 text-white rounded-tr-none'
                                    }`}
                            >
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu Options */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                <p className="text-xs text-gray-400 mb-2 px-1 font-medium">자주 묻는 질문</p>
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {MENU_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            className="text-left text-sm px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors border border-slate-100 hover:border-slate-200"
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ChatWindow;

