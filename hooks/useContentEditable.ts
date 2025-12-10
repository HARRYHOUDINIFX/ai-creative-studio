import { useState, useRef, useCallback } from 'react';

interface UseContentEditableProps {
    initialContent: string;
    onUpdate: (content: string) => void;
}

export const useContentEditable = ({ initialContent, onUpdate }: UseContentEditableProps) => {
    const contentRef = useRef<HTMLElement | null>(null);
    const savedSelection = useRef<Range | null>(null);

    // Undo/Redo Stacks
    const undoStack = useRef<string[]>([]);
    const redoStack = useRef<string[]>([]);

    const saveToUndoStack = useCallback(() => {
        if (contentRef.current) {
            const currentHTML = contentRef.current.innerHTML;
            if (undoStack.current.length === 0 || undoStack.current[undoStack.current.length - 1] !== currentHTML) {
                undoStack.current.push(currentHTML);
                if (undoStack.current.length > 50) undoStack.current.shift();
                redoStack.current = [];
            }
        }
    }, []);

    const handleUndo = useCallback(() => {
        if (undoStack.current.length > 1 && contentRef.current) {
            const current = undoStack.current.pop()!;
            redoStack.current.push(current);
            const prev = undoStack.current[undoStack.current.length - 1];
            contentRef.current.innerHTML = prev;
            onUpdate(prev);
        }
    }, [onUpdate]);

    const handleRedo = useCallback(() => {
        if (redoStack.current.length > 0 && contentRef.current) {
            const next = redoStack.current.pop()!;
            undoStack.current.push(next);
            contentRef.current.innerHTML = next;
            onUpdate(next);
        }
    }, [onUpdate]);

    const saveCurrentSelection = useCallback(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedSelection.current = selection.getRangeAt(0).cloneRange();
        }
    }, []);

    const restoreSelection = useCallback(() => {
        if (savedSelection.current) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(savedSelection.current);
            }
        }
    }, []);

    const applyCommand = useCallback((command: string, value?: string) => {
        restoreSelection();
        document.execCommand(command, false, value);
        if (contentRef.current) {
            onUpdate(contentRef.current.innerHTML);
        }
        saveCurrentSelection();
    }, [restoreSelection, onUpdate, saveCurrentSelection]);

    const handleInput = useCallback(() => {
        // Input event is not fired for contentEditable in React in the same way,
        // usually handled by onInput prop on element
        if (contentRef.current) {
            onUpdate(contentRef.current.innerHTML);
        }
    }, [onUpdate]);

    return {
        contentRef,
        saveToUndoStack,
        handleUndo,
        handleRedo,
        saveCurrentSelection,
        restoreSelection,
        applyCommand,
        handleInput
    };
};
