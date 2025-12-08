import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const ConsultationButton: React.FC = () => {
    const { isChatOpen, toggleChat } = useChat();

    return (
        <button
            onClick={toggleChat}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all duration-300 ring-2 ring-white/20 ${isChatOpen
                ? 'bg-slate-800 hover:bg-slate-900 text-white rotate-0'
                : 'bg-primary-600 hover:bg-primary-700 hover:scale-105 text-white animate-bounce-subtle'
                }`}
        >
            {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            <span className="font-bold">{isChatOpen ? '닫기' : '상담톡 문의'}</span>
        </button>
    );
};

export default ConsultationButton;
