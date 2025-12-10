import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEdit } from '../context/EditContext';
import { Plus, Trash2, ArrowLeft, Loader2, ImageIcon } from 'lucide-react';

const PortfolioPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const {
        projects,
        updateProjectItems,
        updateProject,
        isEditMode,
        toggleEditMode,
        saveProject
    } = useEdit();

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Find current project
    const currentProject = projects.find(p => p.id === projectId);

    const [loading, setLoading] = useState(true);

    // Initial load check
    useEffect(() => {
        if (projects.length > 0 || projectId) {
            setLoading(false);
        }
    }, [projects, projectId]);

    if (!currentProject) {
        if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h2>
                <p className="text-slate-500 mb-6">The project you are looking for does not exist.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                    Back to Portfolio
                </button>
            </div>
        );
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToBlob(file);
            if (url) {
                const newItem = {
                    id: Date.now().toString(),
                    url,
                    name: file.name,
                    type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
                    title: 'Untitled'
                };
                // Update Project Items
                updateProjectItems(currentProject.id, [...currentProject.items, newItem]);
                saveProject(); // Auto save
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Upload file to Vercel Blob (Raw Binary)
    const uploadToBlob = async (file: File): Promise<string | null> => {
        try {
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Upload error details:', errorData);
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    };

    const handleDelete = (itemId: string) => {
        if (window.confirm('Delete this item?')) {
            const newItems = currentProject.items.filter(item => item.id !== itemId);
            updateProjectItems(currentProject.id, newItems);
        }
    };

    const handleUpdateItem = (itemId: string, updates: any) => {
        const newItems = currentProject.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        updateProjectItems(currentProject.id, newItems);
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-12">

            {/* Nav Back */}
            <button
                onClick={() => navigate('/')}
                className="group flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-8 font-medium"
            >
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Projects
            </button>

            <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex-1">
                    {isEditMode ? (
                        <div className="flex flex-col gap-2 w-full">
                            <span className="text-slate-400 text-sm font-mono tracking-wider">EDITING PROJECT TITLE:</span>
                            <input
                                type="text"
                                value={currentProject.title}
                                onChange={(e) => updateProject(currentProject.id, { title: e.target.value })}
                                className="text-4xl md:text-5xl font-bold text-slate-900 bg-slate-50 border-b-2 border-slate-200 focus:border-primary-500 outline-none w-full py-2 transition-all"
                                placeholder="Enter Project Name"
                            />
                        </div>
                    ) : (
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                            {currentProject.title}
                        </h1>
                    )}
                    <p className="text-slate-600 text-lg mt-2">
                        {currentProject.items.length} Items
                    </p>
                </div>

                <div className="flex gap-4 shrink-0">
                    {isEditMode && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors border flex items-center gap-2 ${uploading
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-900/10'
                                }`}
                        >
                            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            {uploading ? 'Uploading...' : 'Add Media'}
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*"
                    />
                    {import.meta.env.DEV && (
                        <button
                            onClick={toggleEditMode}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors border ${isEditMode
                                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {isEditMode ? 'Done' : 'Edit Project'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto space-y-24">
                {currentProject.items.length === 0 ? (
                    <div className="text-center py-32 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                        <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                            <ImageIcon size={32} className="opacity-50" />
                        </div>
                        <p className="text-lg font-medium">This project is empty.</p>
                        <p className="text-sm opacity-70 mt-1">Click 'Add Media' to upload images or videos.</p>
                    </div>
                ) : (
                    currentProject.items.map((item) => (
                        <div key={item.id} className="group relative">
                            {/* Media Render */}
                            <div className="w-full flex justify-center bg-slate-50 rounded-2xl overflow-hidden ring-1 ring-slate-900/5 shadow-sm">
                                {item.type === 'video' ? (
                                    <video
                                        src={`${item.url}#t=0.001`}
                                        controls
                                        playsInline
                                        preload="auto"
                                        className="w-full h-full object-contain md:h-auto md:w-auto md:max-h-[80vh] mx-auto"
                                        style={{ backgroundColor: '#000' }}
                                    />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="w-full h-auto"
                                    />
                                )}
                            </div>

                            {/* Title / Edit Controls */}
                            <div className="mt-6 flex justify-between items-start pb-4 border-b border-slate-100">
                                <div className="flex-1 max-w-2xl">
                                    {isEditMode ? (
                                        <div className="flex flex-col gap-4">
                                            {/* Main Title Input */}
                                            <input
                                                type="text"
                                                value={item.title || ''}
                                                onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                                                className="w-full bg-slate-50 font-bold border-b-2 border-slate-200 focus:border-primary-500 focus:outline-none py-2 px-2 transition-colors rounded-t-lg text-lg text-slate-900"
                                                placeholder="Main Title (e.g. Naver Blog)"
                                            />

                                            {/* Highlight Input & Controls */}
                                            <div className="flex flex-col bg-slate-50/50 p-2 rounded-lg gap-2">
                                                <input
                                                    type="text"
                                                    value={item.highlight || ''}
                                                    onChange={(e) => handleUpdateItem(item.id, { highlight: e.target.value })}
                                                    className={`w-full bg-transparent border-b border-slate-200 focus:border-primary-500 focus:outline-none py-1 px-2 transition-colors ${item.highlightStyle?.fontSize || 'text-sm'}`}
                                                    style={{ color: item.highlightStyle?.color }}
                                                    placeholder="Highlight Text (e.g. *Rules)"
                                                />

                                                {/* Highlight Style Controls */}
                                                <div className="flex flex-wrap items-center gap-4 p-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Highlight Size</span>
                                                        <div className="flex bg-white rounded border border-slate-200 overflow-hidden">
                                                            {[
                                                                { label: 'S', value: 'text-xs' },
                                                                { label: 'M', value: 'text-sm' },
                                                                { label: 'L', value: 'text-lg' },
                                                                { label: 'XL', value: 'text-xl' },
                                                            ].map((size) => (
                                                                <button
                                                                    key={size.label}
                                                                    onClick={() => handleUpdateItem(item.id, {
                                                                        highlightStyle: { ...item.highlightStyle, fontSize: size.value }
                                                                    })}
                                                                    className={`px-2 py-1 text-[10px] font-medium transition-colors ${(item.highlightStyle?.fontSize || 'text-sm') === size.value
                                                                            ? 'bg-slate-900 text-white'
                                                                            : 'hover:bg-slate-50 text-slate-600'
                                                                        }`}
                                                                >
                                                                    {size.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="w-px h-4 bg-slate-200" />

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Color</span>
                                                        <input
                                                            type="color"
                                                            value={item.highlightStyle?.color || '#0f172a'}
                                                            onChange={(e) => handleUpdateItem(item.id, {
                                                                highlightStyle: { ...item.highlightStyle, color: e.target.value }
                                                            })}
                                                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <h2 className="text-2xl font-bold text-slate-900 flex flex-wrap items-baseline gap-2">
                                            <span>{item.title || 'Untitled'}</span>
                                            {item.highlight && (
                                                <span
                                                    className={`${item.highlightStyle?.fontSize || 'text-sm'}`}
                                                    style={{ color: item.highlightStyle?.color }}
                                                >
                                                    {item.highlight}
                                                </span>
                                            )}
                                        </h2>
                                    )}
                                </div>

                                {isEditMode && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="ml-4 text-slate-400 hover:text-red-500 text-sm transition-colors hover:bg-red-50 p-2 rounded-lg"
                                        title="Delete Item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )))}
            </div>
        </div >
    );
};

export default PortfolioPage;
