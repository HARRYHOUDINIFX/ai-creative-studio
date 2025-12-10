import React, { useState, useRef, useEffect } from 'react';
import {
    Type, Palette, X, AlignLeft, AlignCenter, AlignRight,
    MoveHorizontal, MoveVertical, BoxSelect, CaseSensitive,
    Maximize2, Layout, GripHorizontal
} from 'lucide-react';

interface EditableToolbarProps {
    style: React.CSSProperties;
    computedStyle: { fontSize?: string; color?: string };
    updateStyle: (key: keyof React.CSSProperties, value: string | number) => void;
    applyCommand: (command: string) => void;
    applyColorToSelection: (color: string) => void;
    onClose: () => void;
    activeTab: 'text' | 'box';
    setActiveTab: (tab: 'text' | 'box') => void;
}

export const EditableToolbar: React.FC<EditableToolbarProps> = ({
    style,
    computedStyle,
    updateStyle,
    applyCommand,
    applyColorToSelection,
    onClose,
    activeTab,
    setActiveTab
}) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setPos({
                x: dragStart.current.posX + dx,
                y: dragStart.current.posY + dy
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const startDrag = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            posX: pos.x,
            posY: pos.y
        };
    };

    const getPixelValue = (val: string | number | undefined) => parseInt(String(val)) || 0;
    const snapValue = (val: number) => Math.round(val / 4) * 4;

    return (
        <div
            className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[280px] cursor-default text-left"
            style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(30% + ${pos.y}px)`,
                transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            contentEditable={false}
        >
            {/* Drag Handle */}
            <div
                className="absolute top-0 left-0 right-0 h-8 cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-b from-slate-100 to-transparent rounded-t-xl"
                onMouseDown={startDrag}
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
                    <button onClick={onClose} className="px-2 text-slate-400 hover:text-red-500">
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
                                {/* Palette */}
                                {['#000000', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                                    <button
                                        key={color}
                                        className="w-4 h-4 rounded-sm border border-slate-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => applyColorToSelection(color)}
                                    />
                                ))}
                                {/* Color Picker */}
                                <input
                                    type="color"
                                    className="w-4 h-4 bg-transparent border border-slate-300 rounded-sm p-0 cursor-pointer"
                                    value={String(style.color || '#000000')}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onChange={(e) => applyColorToSelection(e.target.value)}
                                    title="커스텀 색상 선택"
                                />
                            </div>
                            {/* Bold/Italic/Underline */}
                            <div className="flex items-center gap-1">
                                <button
                                    className="px-2 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => applyCommand('bold')}
                                    title="Bold"
                                >
                                    B
                                </button>
                                <button
                                    className="px-2 py-1 text-xs italic bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => applyCommand('italic')}
                                    title="Italic"
                                >
                                    I
                                </button>
                                <button
                                    className="px-2 py-1 text-xs underline bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => applyCommand('underline')}
                                    title="Underline"
                                >
                                    U
                                </button>
                            </div>
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
    );
};
