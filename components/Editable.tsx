import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { useEdit } from '../context/EditContext';
import { EditableToolbar } from './EditableToolbar';
import { useDraggable } from '../hooks/useDraggable';
import { useContentEditable } from '../hooks/useContentEditable';

interface EditableProps {
  tagName?: any;
  className?: string;
  text?: string | number;
  html?: string;
  children?: React.ReactNode;
  id?: string;
  blockedStyles?: string[];
}

const Editable: React.FC<EditableProps> = ({ tagName: Tag = 'div', className = '', text, html, children, id: propId, blockedStyles = [] }) => {
  const { isEditMode, registerElement, updateElement } = useEdit();
  const autoId = useId();
  const elementId = propId || `editable-${autoId}`;

  // State initialization
  const [styleVersion, setStyleVersion] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'box'>('text');

  // Refs to allow hooks to update these without re-render loops or stale closures
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Style ref to avoid re-renders when style changes slightly during drag, but we want version to trigger renders when needed
  const styleRef = useRef<React.CSSProperties>({});

  // Initial Load Flag
  const isInitialized = useRef(false);
  const initialContentRef = useRef<string>(String(text || html || ''));

  // Sync with Context
  useEffect(() => {
    if (!isInitialized.current) {
      const initialData = {
        content: text || html || '',
        style: {}
      };
      const savedData = registerElement(elementId, initialData);

      if (savedData) {
        if (savedData.style) {
          styleRef.current = savedData.style;
        }
        if (savedData.content !== undefined) {
          initialContentRef.current = String(savedData.content);
        }
      }
      isInitialized.current = true;
      setStyleVersion(v => v + 1);
    }
  }, [elementId, registerElement, text, html]);


  // Update Handler for Hooks
  const handleContentUpdate = useCallback((newContent: string) => {
    updateElement(elementId, { content: newContent, style: styleRef.current });
  }, [elementId, updateElement]);

  const {
    contentRef,
    handleInput,
    applyCommand,
    saveToUndoStack,
    saveCurrentSelection,
    handleUndo,
    handleRedo
  } = useContentEditable({
    initialContent: initialContentRef.current,
    onUpdate: handleContentUpdate
  });

  const handleDragEnd = useCallback((finalTransform: string) => {
    const newStyle = { ...styleRef.current, transform: finalTransform };
    styleRef.current = newStyle;
    setStyleVersion(v => v + 1);
    updateElement(elementId, { content: contentRef.current?.innerHTML || initialContentRef.current, style: newStyle });
  }, [elementId, updateElement, contentRef]);

  const { isDragging: isDraggingElement, startDrag: startElementDrag, transform: currentTransform } = useDraggable(
    styleRef.current.transform,
    handleDragEnd,
    activeTab === 'box'
  );

  // Computed styles for Toolbar
  const [computedStyle, setComputedStyle] = useState<{ fontSize?: string; color?: string }>({});

  useEffect(() => {
    if (showToolbar && contentRef.current) {
      const computed = window.getComputedStyle(contentRef.current);
      setComputedStyle({
        fontSize: computed.fontSize,
        color: computed.color
      });
      // Sync styles if missing
      const current = styleRef.current;
      let changed = false;
      const next = { ...current };

      if (!blockedStyles.includes('fontSize') && !current.fontSize && computed.fontSize) { next.fontSize = computed.fontSize; changed = true; }
      if (!blockedStyles.includes('color') && !current.color && computed.color !== 'rgba(0, 0, 0, 0)') { next.color = computed.color; changed = true; }
      if (!blockedStyles.includes('textAlign') && !current.textAlign && computed.textAlign) { next.textAlign = computed.textAlign as any; changed = true; }

      if (changed) {
        styleRef.current = next;
        setStyleVersion(v => v + 1);
      }
    }
  }, [showToolbar, blockedStyles, contentRef]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
      }
    };
    if (showToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolbar]);

  // Update Style Helper
  const updateStyle = useCallback((key: keyof React.CSSProperties, value: string | number) => {
    const newStyle = { ...styleRef.current };
    if (value === '' || value === null) {
      delete newStyle[key];
    } else {
      (newStyle as any)[key] = value;
    }
    styleRef.current = newStyle;
    setStyleVersion(v => v + 1);
    updateElement(elementId, { content: contentRef.current?.innerHTML || initialContentRef.current, style: newStyle });
  }, [elementId, updateElement, contentRef]);

  const applyColorToSelection = useCallback((color: string) => {
    applyCommand('foreColor', color);
  }, [applyCommand]);


  // Initialize Content Ref with saved content on mount
  const setContentRefCallback = useCallback((node: HTMLElement | null) => {
    if (node) {
      // @ts-ignore - assigning to readonly ref for hook usage
      contentRef.current = node;

      // Load saved content
      const savedData = registerElement(elementId, { content: initialContentRef.current, style: styleRef.current });
      if (savedData && savedData.content !== undefined) {
        node.innerHTML = String(savedData.content);
      } else {
        node.innerHTML = initialContentRef.current;
      }
    }
  }, [elementId, registerElement, contentRef]);


  if (!isEditMode) {
    // Render Static View
    const savedData = registerElement(elementId, { content: initialContentRef.current, style: styleRef.current });
    const displayStyle = {
      ...(savedData?.style || styleRef.current),
      resize: 'none',
      overflow: 'visible'
    } as React.CSSProperties;
    const displayContent = savedData?.content !== undefined ? String(savedData.content) : initialContentRef.current;

    if (html) return <Tag className={className} style={displayStyle} dangerouslySetInnerHTML={{ __html: displayContent }} />;
    return <Tag className={className} style={displayStyle}>{children || displayContent}</Tag>;
  }

  const { transform: savedTransform, ...innerStyle } = styleRef.current;

  // Style cleanup
  blockedStyles.forEach(key => delete (innerStyle as any)[key]);

  // Merge transform from local drag state if dragging, else from style
  const efficientTransform = isDraggingElement ? currentTransform : savedTransform;

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${['div', 'li', 'h1', 'h2', 'h3', 'p'].includes(Tag) ? 'w-full' : ''}`}
      style={{ transform: efficientTransform as string }} // Cast for TS compatibility if needed
    >
      {showToolbar && (
        <EditableToolbar
          style={styleRef.current}
          computedStyle={computedStyle}
          updateStyle={updateStyle}
          applyCommand={applyCommand}
          applyColorToSelection={applyColorToSelection}
          onClose={() => setShowToolbar(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      <Tag
        ref={setContentRefCallback}
        contentEditable={true}
        suppressContentEditableWarning={true}
        className={`${className} outline-none transition-all min-w-[20px] 
                  ${showToolbar ? 'ring-2 ring-primary-500 z-50 relative' : 'hover:ring-2 hover:ring-primary-300/50 hover:bg-primary-50/30'} 
                  ${activeTab === 'box' ? 'cursor-move select-none' : 'cursor-text'}`}
        style={{
          resize: 'both',
          overflow: 'hidden',
          display: innerStyle.display || (['span', 'strong', 'em', 'a'].includes(Tag) ? 'inline-block' : 'block'),
          verticalAlign: 'top',
          whiteSpace: 'pre-wrap',
          ...innerStyle,
          transform: undefined
        }}
        onInput={handleInput}
        onBlur={handleInput}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setShowToolbar(true);
        }}
        onMouseDown={(e: React.MouseEvent) => {
          if (activeTab === 'box') startElementDrag(e);
        }}
        onMouseUp={saveCurrentSelection}
        onFocus={saveToUndoStack}
        onKeyUp={(e: React.KeyboardEvent) => {
          saveToUndoStack();
          saveCurrentSelection();
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
          if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) { e.preventDefault(); handleRedo(); }
        }}
      />
    </div>
  );
};

export default Editable;