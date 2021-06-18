import { useCallback, useEffect, useRef } from "react";

export function IsMounted() {
    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    useEffect(() => {
        return () => void (isMountedRef.current = false);
    }, []);

    return isMounted;
}