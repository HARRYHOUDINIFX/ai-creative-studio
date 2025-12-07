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

const STORAGE_KEY = 'ai_studio_project_data_v1';
const PORTFOLIO_STORAGE_KEY = 'ai_studio_portfolio_data_v1';

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [elements, setElements] = useState<Record<string, ElementData>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const saveTimerRef = useRef<number | null>(null);

  // Load implementation
  const loadFromFile = async () => {
    // 1. Load Page Elements (Header, etc.)
    if (import.meta.env.DEV) {
      try {
        const response = await fetch('/api/load-data');
        if (response.ok) {
          const data = await response.json();
          if (Object.keys(data).length > 0) setElements(data);
        }
      } catch (e) {
        console.log('Dev: Project file load failed');
      }
    } else {
      // Prod: Load from localStorage or Static JSON if we had one for elements
      // Currently elements mainly use LS in prod
      try {
        const savedProject = localStorage.getItem(STORAGE_KEY);
        if (savedProject) {
          const parsed = JSON.parse(savedProject);
          setElements(prev => Object.keys(prev).length === 0 ? parsed : prev);
        }
      } catch (e) { }
    }

    // 2. Load Portfolio Data (Projects)
    // In BOTH Dev and Prod, we prefer fetching the static JSON file 'public/data/portfolio-data.json'
    // Dev: API or Static. Prod: Static.
    try {
      // Uses the static path. In dev, vite serves public/ at root. In prod, same.
      const response = await fetch('/data/portfolio-data.json?t=' + new Date().getTime());
      if (response.ok) {
        const data = await response.json();

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
        console.warn('Portfolio data not found, checking local storage');
        throw new Error('No static file');
      }
    } catch (e) {
      // Fallback to LocalStorage
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
    // 1. Try API endpoints ONLY in development
    if (import.meta.env.DEV) {
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
    setElements(prev => ({
      ...prev,
      [id]: { ...prev[id], ...data }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Project Helper Functions
  const updateProjectItems = useCallback((projectId: string, items: PortfolioItem[]) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, items } : p));
    setHasUnsavedChanges(true);
  }, []);

  const updateProject = useCallback((projectId: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
    setHasUnsavedChanges(true);
  }, []);

  const createNewProject = useCallback((title: string) => {
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
    setProjects(prev => prev.filter(p => p.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const saveProject = useCallback(async () => {
    try {
      const success = await saveToFile(elements, projects);
      setHasUnsavedChanges(false);
      if (success && import.meta.env.DEV) {
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