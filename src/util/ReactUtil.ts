import { useCallback, useEffect, useRef } from 'react'

function useIsMounted() {
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        }
    }, [])
    return useCallback(() => isMounted.current, []);
}

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export { useIsMounted };