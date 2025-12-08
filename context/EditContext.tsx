import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

interface ElementData {
  content: string | number;
  style: React.CSSProperties;
}

export interface PortfolioItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  title?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  items: PortfolioItem[];
}

interface EditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  registerElement: (id: string, initialData: ElementData) => ElementData;
  updateElement: (id: string, data: Partial<ElementData>) => void;

  // Portfolio
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Legacy support & Helper
  updateProjectItems: (projectId: string, items: PortfolioItem[]) => void;
  updateProject: (projectId: string, data: Partial<Project>) => void;
  createNewProject: (title: string) => void;
  deleteProject: (id: string) => void;

  saveProject: () => void;
  resetProject: () => void;
  hasUnsavedChanges: boolean;
  isLoaded: boolean;
}

export const EditContext = createContext<EditContextType>({
  isEditMode: false,
  toggleEditMode: () => { },
  registerElement: () => ({ content: '', style: {} }),
  updateElement: () => { },
  projects: [],
  setProjects: () => { },
  currentProject: null,
  setCurrentProject: () => { },
  updateProjectItems: () => { },
  updateProject: () => { },
  createNewProject: () => { },
  deleteProject: () => { },
  saveProject: () => { },
  resetProject: () => { },
  hasUnsavedChanges: false,
  isLoaded: false,
});

const STORAGE_KEY = 'ai_studio_project_data_v12';
const PORTFOLIO_STORAGE_KEY = 'ai_studio_portfolio_data_v1';

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [elements, setElements] = useState<Record<string, ElementData>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const saveTimerRef = useRef<number | null>(null);

  // Global Undo/Redo Stacks
  const historyRef = useRef<{ elements: Record<string, ElementData>; projects: Project[] }[]>([]);
  const futureRef = useRef<{ elements: Record<string, ElementData>; projects: Project[] }[]>([]);

  const saveCheckpoint = useCallback(() => {
    historyRef.current.push({
      elements: JSON.parse(JSON.stringify(elements)),
      projects: JSON.parse(JSON.stringify(projects))
    });
    // Limit history size
    if (historyRef.current.length > 50) historyRef.current.shift();
    // Clear future on new change
    futureRef.current = [];
  }, [elements, projects]);

  const handleGlobalUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;

    // Save current state to future
    futureRef.current.push({
      elements: JSON.parse(JSON.stringify(elements)),
      projects: JSON.parse(JSON.stringify(projects))
    });

    const previous = historyRef.current.pop()!;
    setElements(previous.elements);
    setProjects(previous.projects);
    setHasUnsavedChanges(true); // Undo is a change
  }, [elements, projects]);

  const handleGlobalRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;

    // Save current state to history
    historyRef.current.push({
      elements: JSON.parse(JSON.stringify(elements)),
      projects: JSON.parse(JSON.stringify(projects))
    });

    const next = futureRef.current.pop()!;
    setElements(next.elements);
    setProjects(next.projects);
    setHasUnsavedChanges(true);
  }, [elements, projects]);

  // Global Keydown Listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) return;

      // Ignore if user is typing in an input/textarea/contentEditable
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleGlobalUndo();
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleGlobalRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, handleGlobalUndo, handleGlobalRedo]);


  const loadFromFile = async () => {
    // 1. Load Page Elements (Header, etc.)
    // Priority: Static JSON (Build time) -> API (Blob/LocalFS) -> LocalStorage
    let elementsLoaded = false;

    try {
      // Try loading from static file first
      const staticResponse = await fetch('/data/project-data.json?t=' + new Date().getTime());
      if (staticResponse.ok) {
        const data = await staticResponse.json();
        if (data && Object.keys(data).length > 0) {
          setElements(data);
          elementsLoaded = true;
        }
      }
    } catch (e) {
      console.log('Static file load failed', e);
    }

    // Fallback to API if static failed
    if (!elementsLoaded) {
      try {
        const response = await fetch('/api/load-data');
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            setElements(data);
            elementsLoaded = true;
          }
        }
      } catch (e) {
        console.log('Project file load failed', e);
      }
    }

    // Prod: Load from localStorage if all above failed
    if (!elementsLoaded && !import.meta.env.DEV) {
      try {
        const savedProject = localStorage.getItem(STORAGE_KEY);
        if (savedProject) {
          const parsed = JSON.parse(savedProject);
          setElements(parsed);
        }
      } catch (e) { }
    }

    // 2. Load Portfolio Data (Projects)
    // Priority: API (Blob/LocalFS) -> Static JSON (Build time) -> LocalStorage
    try {
      // Try loading from persistence layer first
      const apiResponse = await fetch('/api/load-portfolio');
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        // Check if data is valid array
        if (Array.isArray(data) && data.length > 0) {
          // Success - load from persistence
          setProjects(data as Project[]);
          return;
        }
      }

      // If API failed or returned empty/404, fallback to Static JSON
      console.log('Persistence layer empty or failed, falling back to static data');
      const staticResponse = await fetch('/data/portfolio-data.json?t=' + new Date().getTime());
      if (staticResponse.ok) {
        const data = await staticResponse.json();

        // Migration: Check if data is Array of Items (Legacy) or Array of Projects
        if (Array.isArray(data)) {
          if (data.length > 0 && 'url' in data[0]) {
            // It's a list of items (Legacy)
            const legacyProject: Project = {
              id: 'default',
              title: 'Untitled Project',
              items: data as PortfolioItem[]
            };
            setProjects([legacyProject]);
          } else {
            // It's likely already Projects
            setProjects(data as Project[]);
          }
        }
      } else {
        throw new Error('No static file');
      }
    } catch (e) {
      // Fallback to LocalStorage
      console.warn('Fallback to LocalStorage');
      const savedPortfolio = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio);
        // Handle migration for LS data too
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && 'url' in parsed[0]) {
            setProjects([{ id: 'default', title: 'My Project', items: parsed }]);
          } else {
            setProjects(parsed);
          }
        }
      }
    }
  };

  // Save implementation
  const saveToFile = async (data: Record<string, ElementData>, projs: Project[]) => {
    // 1. Try API endpoints (Dev: Middleware, Prod: Vercel Function)
    try {
      await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Save projects structure
      await fetch('/api/save-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projs)
      });
    } catch (e) {
      console.error('API Save Failed', e);
    }

    // 2. Always save to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(projs));
      return true;
    } catch (e: any) {
      console.error("LocalStorage Save Failed", e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert('저장 공간이 부족합니다! (브라우저 제한 초과)\n\n큰 이미지나 동영상을 삭제하고 다시 시도해주세요.');
      }
      return false;
    }
  };

  useEffect(() => {
    loadFromFile().finally(() => setIsLoaded(true));
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!isLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = window.setTimeout(async () => {
      if (Object.keys(elements).length > 0 || projects.length > 0) {
        await saveToFile(elements, projects);
        setHasUnsavedChanges(false);
      }
    }, 1000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [elements, projects, isLoaded]);

  const registerElement = useCallback((id: string, initialData: ElementData) => {
    if (elements[id]) return elements[id];
    return initialData;
  }, [elements]);

  const updateElement = useCallback((id: string, data: Partial<ElementData>) => {
    saveCheckpoint();
    setElements(prev => ({
      ...prev,
      [id]: { ...prev[id], ...data }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Project Helper Functions
  const updateProjectItems = useCallback((projectId: string, items: PortfolioItem[]) => {
    saveCheckpoint();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, items } : p));
    setHasUnsavedChanges(true);
  }, []);

  const updateProject = useCallback((projectId: string, data: Partial<Project>) => {
    saveCheckpoint();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
    setHasUnsavedChanges(true);
  }, []);

  const createNewProject = useCallback((title: string) => {
    saveCheckpoint();
    const newProject: Project = {
      id: Date.now().toString(),
      title,
      items: []
    };
    setProjects(prev => [...prev, newProject]);
    setHasUnsavedChanges(true);
  }, []);

  const deleteProject = useCallback((id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    saveCheckpoint();
    setProjects(prev => prev.filter(p => p.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const saveProject = useCallback(async () => {
    try {
      const success = await saveToFile(elements, projects);
      setHasUnsavedChanges(false);
      if (success) {
        alert('저장이 완료되었습니다.');
      }
    } catch (e) {
      alert('저장 중 오류가 발생했습니다.');
    }
  }, [elements, projects]);

  const resetProject = useCallback(async () => {
    if (window.confirm('모든 변경사항을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PORTFOLIO_STORAGE_KEY);

      if (import.meta.env.DEV) {
        try {
          await fetch('/api/save-data', { method: 'POST', body: '{}' });
          await fetch('/api/save-portfolio', { method: 'POST', body: '[]' });
        } catch (e) { }
      }
      window.location.reload();
    }
  }, []);

  return (
    <EditContext.Provider value={{
      isEditMode,
      toggleEditMode: () => setIsEditMode(!isEditMode),
      registerElement,
      updateElement,
      projects,
      setProjects,
      currentProject,
      setCurrentProject,
      updateProjectItems,
      updateProject,
      createNewProject,
      deleteProject,
      saveProject,
      resetProject,
      hasUnsavedChanges,
      isLoaded
    }}>
      {children}
    </EditContext.Provider>
  );
};

export const useEdit = () => useContext(EditContext);