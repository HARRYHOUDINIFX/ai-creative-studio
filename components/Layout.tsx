import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Menu, X, CreditCard, LayoutGrid } from 'lucide-react';
import EditToggle from './EditToggle';
import ConsultationButton from './ConsultationButton';
import { ChatProvider, useChat } from '../context/ChatContext';
import ChatWindow from './ChatWindow';

const LayoutContent: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isChatOpen, closeChat } = useChat();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navItems = [
        { name: '포트폴리오', path: '/', icon: LayoutGrid },
        { name: '요금 안내', path: '/pricing', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-500 selection:text-white flex">
            <EditToggle />

            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-6 left-6 z-50 p-2 rounded-full bg-white shadow-lg md:hidden text-slate-900 ring-1 ring-slate-200"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo / Header */}
                    <div className="p-8 border-b border-slate-800">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                            Visual Boost
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Creative Studio</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-6 border-t border-slate-800">
                        <p className="text-xs text-slate-500 text-center">
                            © 2025 Visual Boost
                        </p>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col relative w-full">
                {/* Scrollable content */}
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>

            <ConsultationButton />
            {isChatOpen && <ChatWindow onClose={closeChat} />}
        </div>
    );
};

const Layout: React.FC = () => {
    return (
        <ChatProvider>
            <LayoutContent />
        </ChatProvider>
    );
};

export default Layout;
