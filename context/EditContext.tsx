import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';

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
  titleStyle?: {
    fontSize?: string;
    color?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  items: PortfolioItem[];
  titleStyle?: {
    fontSize?: string;
    color?: string;
  };
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

const STORAGE_KEY = 'ai_studio_project_data_v13';
const PORTFOLIO_STORAGE_KEY = 'ai_studio_portfolio_data_v1';

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // Use generic types to avoid heavy object duplication if possible, but structure requires object
  // Use generic types to avoid heavy object duplication if possible, but structure requires object
  const [elements, setElements] = useState<Record<string, ElementData>>(() => {
    if (typeof window !== 'undefined' && !import.meta.env.DEV) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return {};
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined' && !import.meta.env.DEV) {
      try {
        const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Legacy migration logic inline
          if (Array.isArray(parsed) && parsed.length > 0 && 'url' in parsed[0]) {
            return [{ id: 'default', title: 'My Project', items: parsed }];
          }
          return parsed;
        }
      } catch (e) { }
    }
    return [];
  });

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Debounce saving inputs to prevent excessive writes
  // We track "version" or "timestamp" of last change to trigger save
  const [lastChangeTime, setLastChangeTime] = useState(0);
  const debouncedChangeTime = useDebounce(lastChangeTime, 2000); // Save after 2 seconds of inactivity

  // Global Undo/Redo Stacks
  const historyRef = useRef<{ elements: Record<string, ElementData>; projects: Project[] }[]>([]);
  const futureRef = useRef<{ elements: Record<string, ElementData>; projects: Project[] }[]>([]);

  const saveCheckpoint = useCallback(() => {
    // Only save if different from last checkpoint
    const last = historyRef.current[historyRef.current.length - 1];
    if (last) {
      // Simple check to avoid deep comparison every time, can be optimized further
      // Here we just accept we might push duplicates if we don't deeply compare
      // But for performance, we push.
    }
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
    setHasUnsavedChanges(true);
    setLastChangeTime(Date.now());
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
    setLastChangeTime(Date.now());
  }, [elements, projects]);

  // Global Keydown Listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) return;
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
    let elementsLoaded = false;
    try {
      const staticResponse = await fetch('/data/project-data.json?t=' + new Date().getTime());
      if (staticResponse.ok) {
        const data = await staticResponse.json();
        if (data && Object.keys(data).length > 0) {
          setElements(data);
          elementsLoaded = true;
        }
      }
    } catch (e) { console.log('Static file load failed'); }

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
        // console.log('Project file load failed', e);
      }
    }

    if (!elementsLoaded && !import.meta.env.DEV) {
      try {
        const savedProject = localStorage.getItem(STORAGE_KEY);
        if (savedProject) setElements(JSON.parse(savedProject));
      } catch (e) { }
    }

    // Load Projects
    try {
      const apiResponse = await fetch('/api/load-portfolio');
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data as Project[]);
          return;
        }
      }
      // Fallback
      const staticResponse = await fetch('/data/portfolio-data.json?t=' + new Date().getTime());
      if (staticResponse.ok) {
        const data = await staticResponse.json();
        if (Array.isArray(data)) {
          if (data.length > 0 && 'url' in data[0]) {
            setProjects([{ id: 'default', title: 'Untitled Project', items: data as PortfolioItem[] }]);
          } else {
            setProjects(data as Project[]);
          }
        }
      }
    } catch (e) {
      const savedPortfolio = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio);
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

  const saveToFile = async (data: Record<string, ElementData>, projs: Project[]) => {
    try {
      if (import.meta.env.DEV) {
        // Only use API saving in Dev mode usually, or if configured
        await fetch('/api/save-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        await fetch('/api/save-portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projs)
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(projs));
      return true;
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert('저장 공간이 부족합니다! 큰 이미지나 동영상을 삭제하고 다시 시도해주세요.');
      }
      return false;
    }
  };

  useEffect(() => {
    loadFromFile().finally(() => setIsLoaded(true));
  }, []);

  // Debounced Auto-save
  useEffect(() => {
    if (!isLoaded || debouncedChangeTime === 0) return;
    if (hasUnsavedChanges) {
      saveToFile(elements, projects).then(() => {
        // Optional logic after auto-save
        // console.log('Auto-saved');
      });
    }
  }, [debouncedChangeTime, isLoaded]); // Only runs when debounced value updates


  const registerElement = useCallback((id: string, initialData: ElementData) => {
    // If element exists, return it, else return initial
    // Optimization: Don't update state here synchronously during render if not needed
    if (elements[id]) return elements[id];
    return initialData;
    // Note: We don't automatically setElements here to avoid infinite loops during render.
    // Elements should be registered via effects if they strictly need to be in state immediately.
  }, [elements]);

  // Helper to trigger save
  const markChanged = () => {
    setHasUnsavedChanges(true);
    setLastChangeTime(Date.now());
  };

  const updateElement = useCallback((id: string, data: Partial<ElementData>) => {
    saveCheckpoint();
    setElements(prev => ({
      ...prev,
      [id]: { ...prev[id], ...data }
    }));
    markChanged();
  }, []);

  const updateProjectItems = useCallback((projectId: string, items: PortfolioItem[]) => {
    saveCheckpoint();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, items } : p));
    markChanged();
  }, []);

  const updateProject = useCallback((projectId: string, data: Partial<Project>) => {
    saveCheckpoint();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
    markChanged();
  }, []);

  const createNewProject = useCallback((title: string) => {
    saveCheckpoint();
    const newProject: Project = {
      id: Date.now().toString(),
      title,
      items: []
    };
    setProjects(prev => [...prev, newProject]);
    markChanged();
  }, []);

  const deleteProject = useCallback((id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    saveCheckpoint();
    setProjects(prev => prev.filter(p => p.id !== id));
    markChanged();
  }, []);

  const saveProject = useCallback(async () => {
    const success = await saveToFile(elements, projects);
    setHasUnsavedChanges(false);
    if (success && !hasUnsavedChanges) {
      // Logic for manual save button feedback could go here
    }
  }, [elements, projects, hasUnsavedChanges]);

  const resetProject = useCallback(async () => {
    if (window.confirm('모든 변경사항을 초기화하시겠습니까?')) {
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