import React from 'react';
import { useEdit } from '../context/EditContext';
import { Settings, Check, Save, RotateCcw } from 'lucide-react';

const EditToggle: React.FC = () => {
    const { isEditMode, toggleEditMode, saveProject, resetProject, hasUnsavedChanges } = useEdit();

    // 배포 환경(Production)에서는 편집 버튼 숨기기
    if (!import.meta.env.DEV) {
        return null;
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
