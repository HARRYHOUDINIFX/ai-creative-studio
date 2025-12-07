import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEdit } from '../context/EditContext';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

const PortfolioListPage: React.FC = () => {
    const {
        projects,
        createNewProject,
        deleteProject,
        isEditMode,
        toggleEditMode
    } = useEdit();
    const navigate = useNavigate();
    const [newProjectTitle, setNewProjectTitle] = useState('');

    const handleCreate = () => {
        if (!newProjectTitle.trim()) return;
        createNewProject(newProjectTitle);
        setNewProjectTitle('');
    };

    const handleProjectClick = (projectId: string) => {
        navigate(`/portfolio/${projectId}`);
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-12">

            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                        Portfolio
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Select a project to view or edit.
                    </p>
                </div>

                {/* Edit Mode Toggle - Only visible in DEV */}
                {import.meta.env.DEV && (
                    <button
                        onClick={toggleEditMode}
                        className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors border ${isEditMode
                            ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {isEditMode ? 'Done Editing' : 'Manage Projects'}
                    </button>
                )}
            </div>

            {isEditMode && (
                <div className="max-w-7xl mx-auto mb-12 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex gap-4 items-center">
                    <input
                        type="text"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="Enter Project Title (e.g., Brand Design 2024)"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-medium"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newProjectTitle.trim()}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                        Create Project
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div
                            onClick={() => handleProjectClick(project.id)}
                            className="aspect-[4/3] bg-slate-100 relative overflow-hidden"
                        >
                            {project.items.length > 0 ? (
                                project.items[0].type === 'video' ? (
                                    <video
                                        src={project.items[0].url}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        playsInline
                                        onMouseOver={e => e.currentTarget.play().catch(() => { })}
                                        onMouseOut={e => e.currentTarget.pause()}
                                    />
                                ) : (
                                    <img
                                        src={project.items[0].url}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <FolderOpen size={48} strokeWidth={1} />
                                    <span className="text-sm mt-2">Empty Project</span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="p-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 Group-hover:text-primary-600 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 font-medium">
                                    {project.items.length} Items
                                </p>
                            </div>

                            {isEditMode && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteProject(project.id);
                                    }}
                                    className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {projects.length === 0 && !isEditMode && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        <FolderOpen size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No projects added yet.</p>
                        <p className="text-sm opacity-70">Click 'Manage Projects' to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioListPage;
