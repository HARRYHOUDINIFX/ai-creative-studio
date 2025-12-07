import React from 'react';
import { useEdit } from '../context/EditContext';
import { Settings, Check, Save, RotateCcw } from 'lucide-react';

const EditToggle: React.FC = () => {
    const { isEditMode, toggleEditMode, saveProject, resetProject, hasUnsavedChanges } = useEdit();
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [showPasswordInput, setShowPasswordInput] = React.useState(false);
    const [password, setPassword] = React.useState('');

    React.useEffect(() => {
        // Dev mode always authenticated
        if (import.meta.env.DEV) {
            setIsAuthenticated(true);
            return;
        }

        // Check URL for admin param
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true') {
            setShowPasswordInput(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
            setShowPasswordInput(false);
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    };

    // If not authenticated and not showing password input, hide everything (Production Default)
    if (!isAuthenticated && !showPasswordInput) {
        return null;
    }

    // Password Modal
    if (showPasswordInput && !isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-2xl flex flex-col gap-4 min-w-[300px]">
                    <h3 className="text-lg font-bold text-slate-800">관리자 확인</h3>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호 입력"
                        className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        확인
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
            {isEditMode && (
                <>
                    <button
                        onClick={resetProject}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg transition-all bg-white text-slate-600 hover:text-red-500 hover:bg-red-50 ring-1 ring-slate-200"
                        title="초기화"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={saveProject}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg transition-all ${hasUnsavedChanges
                            ? 'bg-blue-600 text-white hover:bg-blue-500 animate-pulse ring-2 ring-blue-300'
                            : 'bg-white text-blue-600 ring-1 ring-blue-100'
                            }`}
                    >
                        <Save size={16} />
                        <span>저장</span>
                    </button>
                </>
            )}

            <button
                onClick={toggleEditMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg transition-all ${isEditMode
                    ? 'bg-green-500 text-white ring-2 ring-green-300'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
            >
                {isEditMode ? (
                    <>
                        <Check size={16} />
                        <span>편집 완료</span>
                    </>
                ) : (
                    <>
                        <Settings size={16} />
                        <span>페이지 편집</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default EditToggle;
