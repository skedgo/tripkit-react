import { useEffect } from 'react';

export function ResizeObserverWrapper({ targetRef, onResize }) {
    useEffect(() => {
        if (!targetRef?.current) return;

        const observer = new ResizeObserver(() => {
            onResize?.();
        });

        observer.observe(targetRef.current);

        return () => {
            observer.disconnect();
        };
    }, [targetRef]);

    return null; // like ReactResizeDetector, nothing is rendered
}

export default ResizeObserverWrapper;
