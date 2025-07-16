import { useEffect, useCallback, useRef } from 'react';

export function ResizeObserverWrapper({ targetRef, onResize }) {
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleResize = useCallback(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce the resize callback to prevent loops
        timeoutRef.current = setTimeout(() => {
            onResize?.();
        }, 0);
    }, [onResize]);

    useEffect(() => {
        if (!targetRef?.current) return;

        const observer = new ResizeObserver((entries) => {
            // Wrap in requestAnimationFrame to avoid the loop error
            requestAnimationFrame(() => {
                handleResize();
            });
        });

        observer.observe(targetRef.current);

        return () => {
            observer.disconnect();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [targetRef, handleResize]);

    return null; // like ReactResizeDetector, nothing is rendered
}

export default ResizeObserverWrapper;
