import { useEffect, useRef, Ref, RefObject } from 'react';

export function useCombinedRefs<T>(...refs: Ref<T>[]): RefObject<T | null> {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        if (targetRef.current !== null) {
          ref(targetRef.current);
        }
      } else {
        if (targetRef.current !== null) {
          (ref as RefObject<T>).current = targetRef.current;
        }
      }
    });
  }, [refs]);

  return targetRef;
}
