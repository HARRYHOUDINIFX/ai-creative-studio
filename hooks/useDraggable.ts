import { useState, useRef, useEffect, useCallback } from 'react';

interface DragResult {
    isDragging: boolean;
    transform: string;
    startDrag: (e: React.MouseEvent) => void;
}

export const useDraggable = (
    initialTransform: string | undefined,
    onDragEnd: (finalTransform: string) => void,
    enabled: boolean
): DragResult => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const currentTranslate = useRef({ x: 0, y: 0 });

    // Parse initial transform
    useEffect(() => {
        if (initialTransform) {
            const match = initialTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
            if (match) {
                currentTranslate.current = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
            }
        }
    }, [initialTransform]);

    const [localTransform, setLocalTransform] = useState(initialTransform || '');

    const startDrag = (e: React.MouseEvent) => {
        if (!enabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;

            let newX = currentTranslate.current.x + dx;
            let newY = currentTranslate.current.y + dy;

            // Snap to 4px
            newX = Math.round(newX / 4) * 4;
            newY = Math.round(newY / 4) * 4;

            const newTransformStr = `translate(${newX}px, ${newY}px)`;
            setLocalTransform(newTransformStr);
        };

        const handleMouseUp = (e: MouseEvent) => {
            setIsDragging(false);

            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;

            let finalX = currentTranslate.current.x + dx;
            let finalY = currentTranslate.current.y + dy;

            finalX = Math.round(finalX / 4) * 4;
            finalY = Math.round(finalY / 4) * 4;

            currentTranslate.current = { x: finalX, y: finalY };
            const finalTransformStr = `translate(${finalX}px, ${finalY}px)`;

            setLocalTransform(finalTransformStr);
            onDragEnd(finalTransformStr);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onDragEnd]);

    return {
        isDragging,
        transform: isDragging ? localTransform : (initialTransform || ''),
        startDrag
    };
};
