import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { useEdit } from '../context/EditContext';
import {
  Type, Palette, X, AlignLeft, AlignCenter, AlignRight,
  MoveHorizontal, MoveVertical, BoxSelect, CaseSensitive,
  Maximize2, Layout, Move, GripHorizontal
} from 'lucide-react';

interface EditableProps {
  tagName?: any;
  className?: string;
  text?: string | number;
  html?: string;
  children?: React.ReactNode;
  id?: string;
}

const Editable: React.FC<EditableProps> = ({ tagName: Tag = 'div', className = '', text, html, children, id: propId }) => {
  const { isEditMode, registerElement, updateElement } = useEdit();

  const autoId = useId();
  const elementId = propId || `editable-${autoId}`;

  // 스타일 상태는 ref로 관리하여 리렌더링 방지
  const styleRef = useRef<React.CSSProperties>({});
  const [styleVersion, setStyleVersion] = useState(0);

  const [showToolbar, setShowToolbar] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'box'>('text');

  // 툴바 드래그 상태
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const toolbarDragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Computed styles state for placeholders
  const [computedStyle, setComputedStyle] = useState<{ fontSize?: string; color?: string }>({});

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const isInitialized = useRef(false);
  const initialContentRef = useRef<string>(String(text || html || ''));
  const contentInitialized = useRef(false); // DOM 콘텐츠 초기화 여부

  // Element Drag State (박스 이동용)
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const elementDragStart = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  // 선택 영역 저장용 (색상 변경 시 선택 유지)
  const savedSelection = useRef<Range | null>(null);

  // Undo/Redo 히스토리 스택
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  // 현재 content 가져오기 (항상 DOM에서 직접)
  const getCurrentContent = useCallback(() => {
    return contentRef.current?.innerHTML || initialContentRef.current;
  }, []);

  // Sync with Global Context on Mount
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
          if (savedData.style.transform) {
            const match = savedData.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
            if (match) {
              currentTranslate.current = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
            }
          }
        }
        if (savedData.content !== undefined) {
          initialContentRef.current = String(savedData.content);
        }
      }
      isInitialized.current = true;
      setStyleVersion(v => v + 1);
    }
  }, [elementId, registerElement, text, html]);

  // 편집 모드 전환 시 contentInitialized 리셋 (새 DOM 노드에 콘텐츠 적용을 위해)
  useEffect(() => {
    contentInitialized.current = false;
  }, [isEditMode]);

  // 저장된 content를 DOM에 직접 적용 (마운트 후 한 번만)
  useEffect(() => {
    if (contentRef.current && isInitialized.current && !contentInitialized.current) {
      const savedData = registerElement(elementId, { content: initialContentRef.current, style: {} });
      if (savedData && savedData.content !== undefined) {
        contentRef.current.innerHTML = String(savedData.content);
      } else {
        contentRef.current.innerHTML = initialContentRef.current;
      }
      contentInitialized.current = true;
    }
  }, [elementId, registerElement, isEditMode]);

  // Read Computed Styles when Toolbar opens
  useEffect(() => {
    if (showToolbar && contentRef.current) {
      const computed = window.getComputedStyle(contentRef.current);
      setComputedStyle({
        fontSize: computed.fontSize,
        color: computed.color
      });

      const currentStyle = styleRef.current;
      let changed = false;
      const next = { ...currentStyle };

      if (!currentStyle.fontSize && computed.fontSize) { next.fontSize = computed.fontSize; changed = true; }
      if (!currentStyle.color && computed.color !== 'rgba(0, 0, 0, 0)') { next.color = computed.color; changed = true; }
      if (!currentStyle.fontWeight && computed.fontWeight) { next.fontWeight = computed.fontWeight as any; changed = true; }
      if (!currentStyle.textAlign && computed.textAlign) { next.textAlign = computed.textAlign as any; changed = true; }

      if (changed) {
        styleRef.current = next;
        setStyleVersion(v => v + 1);
      }
    }
    // 툴바가 열릴 때 위치 초기화
    if (showToolbar) {
      setToolbarPos({ x: 0, y: 0 });
    }
  }, [showToolbar]);

  // Handle outside click to close toolbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
      }
    };
    if (showToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolbar]);

  // 툴바 드래그 로직
  useEffect(() => {
    if (!isDraggingToolbar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - toolbarDragStart.current.x;
      const dy = e.clientY - toolbarDragStart.current.y;
      setToolbarPos({
        x: toolbarDragStart.current.posX + dx,
        y: toolbarDragStart.current.posY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDraggingToolbar(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToolbar]);

  // 요소 드래그 로직 (박스 모드)
  useEffect(() => {
    if (!isDraggingElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - elementDragStart.current.x;
      const dy = e.clientY - elementDragStart.current.y;

      let newX = currentTranslate.current.x + dx;
      let newY = currentTranslate.current.y + dy;

      newX = Math.round(newX / 4) * 4;
      newY = Math.round(newY / 4) * 4;

      const newTransform = `translate(${newX}px, ${newY}px)`;
      styleRef.current = { ...styleRef.current, transform: newTransform };
      setStyleVersion(v => v + 1);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDraggingElement(false);

      const dx = e.clientX - elementDragStart.current.x;
      const dy = e.clientY - elementDragStart.current.y;
      let finalX = currentTranslate.current.x + dx;
      let finalY = currentTranslate.current.y + dy;

      finalX = Math.round(finalX / 4) * 4;
      finalY = Math.round(finalY / 4) * 4;

      currentTranslate.current = { x: finalX, y: finalY };

      const newStyle = { ...styleRef.current, transform: `translate(${finalX}px, ${finalY}px)` };
      styleRef.current = newStyle;
      setStyleVersion(v => v + 1);
      updateElement(elementId, { content: getCurrentContent(), style: newStyle });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingElement, elementId, updateElement, getCurrentContent]);

  const startToolbarDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingToolbar(true);
    toolbarDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: toolbarPos.x,
      posY: toolbarPos.y
    };
  };

  const startElementDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingElement(true);
    elementDragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    const newContent = e.currentTarget.innerHTML;
    updateElement(elementId, { content: newContent, style: styleRef.current });
  }, [elementId, updateElement]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const updateStyle = useCallback((key: keyof React.CSSProperties, value: string | number) => {
    const newStyle = { ...styleRef.current };
    if (value === '' || value === null) {
      delete newStyle[key];
    } else {
      (newStyle as any)[key] = value;
    }
    styleRef.current = newStyle;
    setStyleVersion(v => v + 1);

    updateElement(elementId, { content: getCurrentContent(), style: newStyle });
  }, [elementId, updateElement, getCurrentContent]);

  // Apply color to selected text only (for partial text styling)
  const applyColorToSelection = useCallback((color: string) => {
    // 저장된 선택 영역이 있으면 복원
    if (savedSelection.current && contentRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection.current);

        // 선택 영역에 색상 적용
        document.execCommand('foreColor', false, color);

        // 선택 해제
        savedSelection.current = null;

        // Update content after applying
        setTimeout(() => {
          updateElement(elementId, { content: getCurrentContent(), style: styleRef.current });
        }, 0);
        return;
      }
    }

    // 저장된 선택이 없으면 전체 요소에 색상 적용
    updateStyle('color', color);
  }, [elementId, updateElement, getCurrentContent, updateStyle]);

  // 선택 영역 저장 함수
  const saveCurrentSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      savedSelection.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // Undo 스택에 현재 상태 저장
  const saveToUndoStack = useCallback(() => {
    if (contentRef.current) {
      const currentHTML = contentRef.current.innerHTML;
      // 마지막 저장과 다를 때만 추가
      if (undoStack.current.length === 0 || undoStack.current[undoStack.current.length - 1] !== currentHTML) {
        undoStack.current.push(currentHTML);
        // 새 변경 시 redo 스택 클리어
        redoStack.current = [];
      }
    }
  }, []);

  // Undo 실행
  const handleUndo = useCallback(() => {
    if (undoStack.current.length > 0 && contentRef.current) {
      const currentHTML = contentRef.current.innerHTML;
      redoStack.current.push(currentHTML);
      const previousHTML = undoStack.current.pop()!;
      contentRef.current.innerHTML = previousHTML;
      updateElement(elementId, { content: previousHTML, style: styleRef.current });
    }
  }, [elementId, updateElement]);

  // Redo 실행
  const handleRedo = useCallback(() => {
    if (redoStack.current.length > 0 && contentRef.current) {
      const currentHTML = contentRef.current.innerHTML;
      undoStack.current.push(currentHTML);
      const nextHTML = redoStack.current.pop()!;
      contentRef.current.innerHTML = nextHTML;
      updateElement(elementId, { content: nextHTML, style: styleRef.current });
    }
  }, [elementId, updateElement]);

  const snapValue = (val: number) => Math.round(val / 4) * 4;
  const getPixelValue = (val: string | number | undefined) => parseInt(String(val)) || 0;

  const style = styleRef.current;

  // ref 콜백: 마운트 시 한 번만 innerHTML 설정 (React 리렌더링이 덮어쓰지 않도록)
  // hooks 규칙을 지키기 위해 조건문 이전에 선언
  const setContentRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      contentRef.current = node;
      // DOM 노드가 마운트될 때마다 저장된 콘텐츠 적용
      // (편집 모드 전환 시 새 DOM 노드가 생성되므로 매번 적용 필요)
      const savedData = registerElement(elementId, { content: initialContentRef.current, style: styleRef.current });
      if (savedData && savedData.content !== undefined) {
        node.innerHTML = String(savedData.content);
      } else {
        node.innerHTML = initialContentRef.current;
      }
      contentInitialized.current = true;
    }
  }, [elementId, registerElement]);

  if (!isEditMode) {
    // 비편집 모드에서는 저장된 스타일을 완전히 적용
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

  const { transform, ...innerStyle } = style;



  const commonProps = {
    ref: setContentRef,
    contentEditable: true, // 항상 편집 가능
    suppressContentEditableWarning: true,
    className: `${className} outline-none transition-all min-w-[20px] 
      ${showToolbar ? 'ring-2 ring-primary-500 z-50 relative' : 'hover:ring-2 hover:ring-primary-300/50 hover:bg-primary-50/30'} 
      ${isEditMode ? 'editable-resizing' : ''}
      ${activeTab === 'box' ? 'cursor-move select-none' : 'cursor-text'}`,
    style: {
      resize: isEditMode ? 'both' : 'none',
      overflow: isEditMode ? 'hidden' : 'visible',
      display: style.display || (['span', 'strong', 'em', 'a'].includes(Tag) ? 'inline-block' : 'block'),
      verticalAlign: 'top',
      whiteSpace: 'pre-wrap',
      ...innerStyle,
      transform: undefined
    } as React.CSSProperties,
    onBlur: handleBlur,
    onPaste: handlePaste,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowToolbar(true);
    },
    onMouseDown: (e: React.MouseEvent) => {
      // 박스 모드일 때는 어디든 드래그 가능
      if (activeTab === 'box') {
        startElementDrag(e);
      }
      // 텍스트 모드에서는 일반 텍스트 선택 동작 허용
    },
    onMouseUp: () => {
      // 텍스트 선택 완료 시 선택 영역 저장
      saveCurrentSelection();
    },
    onInput: () => {
      // 입력 시 Undo 스택에 저장
      saveToUndoStack();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
    },
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${['div', 'li', 'h1', 'h2', 'h3', 'p'].includes(Tag) ? 'w-full' : ''}`}
      style={{ transform: transform }}
    >
      {showToolbar && (
        <div
          className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[280px] cursor-default text-left"
          style={{
            left: `calc(50% + ${toolbarPos.x}px)`,
            top: `calc(30% + ${toolbarPos.y}px)`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          contentEditable={false}
        >
          {/* Drag Handle for Toolbar */}
          <div
            className="absolute top-0 left-0 right-0 h-8 cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-b from-slate-100 to-transparent rounded-t-xl"
            onMouseDown={startToolbarDrag}
          >
            <GripHorizontal size={16} className="text-slate-400" />
          </div>

          <div className="pt-4">
            {/* Header / Tabs */}
            <div className="flex gap-1 mb-3 bg-slate-100 p-1 rounded-lg items-center">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'text' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Type size={14} /> 텍스트
              </button>
              <button
                onClick={() => setActiveTab('box')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'box' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BoxSelect size={14} /> 박스
              </button>
              <button onClick={() => setShowToolbar(false)} className="px-2 text-slate-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>

            {/* TEXT TAB */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                {/* Font Family */}
                <div className="flex gap-2">
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 focus:border-primary-500 outline-none text-slate-700"
                    value={String(style.fontFamily || 'Pretendard')}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                  >
                    <option value="Pretendard">기본 (Pretendard)</option>
                    <option value='"Nanum Myeongjo", serif'>명조 (Serif)</option>
                    <option value='"Nanum Gothic Coding", monospace'>고딕 코딩 (Mono)</option>
                  </select>
                </div>

                {/* Size & Color & Weight */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                    <CaseSensitive size={14} className="text-slate-400" />
                    <input
                      type="number"
                      className="w-10 bg-transparent text-xs outline-none text-slate-700"
                      placeholder={String(parseInt(computedStyle.fontSize || '16'))}
                      value={style.fontSize ? parseInt(String(style.fontSize)) : ''}
                      onChange={(e) => updateStyle('fontSize', e.target.value ? e.target.value + 'px' : '')}
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1 py-1">
                    <Palette size={14} className="text-slate-400" />
                    {/* 색상 버튼 팔레트 (선택 영역 유지) */}
                    {['#000000', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                      <button
                        key={color}
                        className="w-4 h-4 rounded-sm border border-slate-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => {
                          e.preventDefault(); // 선택 영역 유지
                        }}
                        onClick={() => applyColorToSelection(color)}
                      />
                    ))}
                    {/* 컬러 피커 */}
                    <input
                      type="color"
                      className="w-4 h-4 bg-transparent border border-slate-300 rounded-sm p-0 cursor-pointer"
                      value={String(style.color || '#000000')}
                      onMouseDown={(e) => e.preventDefault()}
                      onChange={(e) => applyColorToSelection(e.target.value)}
                      title="커스텀 색상 선택"
                    />
                  </div>
                  <select
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded p-1.5 focus:border-primary-500 outline-none text-slate-700"
                    value={style.fontWeight || '400'}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                  >
                    <option value="100">Thin</option>
                    <option value="300">Light</option>
                    <option value="400">Regular</option>
                    <option value="500">Medium</option>
                    <option value="700">Bold</option>
                    <option value="900">Black</option>
                  </select>
                </div>

                {/* Alignment */}
                <div className="flex justify-between bg-slate-50 border border-slate-200 rounded p-1">
                  {[
                    { icon: AlignLeft, val: 'left' },
                    { icon: AlignCenter, val: 'center' },
                    { icon: AlignRight, val: 'right' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => updateStyle('textAlign', item.val)}
                      className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition-all ${style.textAlign === item.val ? 'bg-white shadow text-primary-600' : 'text-slate-400'}`}
                    >
                      <item.icon size={14} />
                    </button>
                  ))}
                </div>

                {/* Spacing Sliders */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <MoveHorizontal size={12} className="text-slate-400" />
                    <span className="text-[10px] text-slate-500 w-8">자간</span>
                    <input
                      type="range" min="-2" max="10" step="0.5"
                      className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      onChange={(e) => updateStyle('letterSpacing', e.target.value + 'px')}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <MoveVertical size={12} className="text-slate-400" />
                    <span className="text-[10px] text-slate-500 w-8">행간</span>
                    <input
                      type="range" min="1" max="3" step="0.1"
                      className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      onChange={(e) => updateStyle('lineHeight', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BOX TAB */}
            {activeTab === 'box' && (
              <div className="space-y-4">
                <div className="text-[10px] text-slate-400 font-medium px-1 flex justify-between">
                  <span>요소 위치 조정</span>
                  <span className="text-primary-500 font-bold">Snap: 4px</span>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed bg-blue-50 p-2 rounded">
                  💡 <strong>박스 모드:</strong> 텍스트 영역 아무 곳이나 잡고 드래그하면 요소가 이동됩니다.
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Maximize2 size={12} /> 외부 간격 (밀어내기)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <label className="text-[10px] text-slate-400 block mb-1">상하</label>
                      <input
                        type="range" min="0" max="100" step="4"
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        value={getPixelValue(style.marginTop)}
                        onChange={(e) => {
                          const val = snapValue(parseInt(e.target.value));
                          updateStyle('marginTop', val + 'px');
                          updateStyle('marginBottom', val + 'px');
                        }}
                      />
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <label className="text-[10px] text-slate-400 block mb-1">좌우</label>
                      <input
                        type="range" min="0" max="100" step="4"
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        value={getPixelValue(style.marginLeft)}
                        onChange={(e) => {
                          const val = snapValue(parseInt(e.target.value));
                          updateStyle('marginLeft', val + 'px');
                          updateStyle('marginRight', val + 'px');
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Layout size={12} /> 내부 여백
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="64" step="4"
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    value={getPixelValue(style.padding)}
                    onChange={(e) => {
                      const val = snapValue(parseInt(e.target.value));
                      updateStyle('padding', val + 'px');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* children을 빈 상태로 렌더링하고, ref 콜백에서 innerHTML 설정 */}
      <Tag {...commonProps} />
    </div>
  );
};

export default Editable;