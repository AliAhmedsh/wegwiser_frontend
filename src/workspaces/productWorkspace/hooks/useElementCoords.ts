import { useEffect, useReducer, RefObject } from 'react';

type ElementCoordsState = {
  top: number;
  left: number;
  scrollTop: number;
  scrollLeft: number;
};

type Action =
  | { type: 'UPDATE'; payload: Partial<ElementCoordsState> }
  | { type: 'RESET' };

function reducer(
  state: ElementCoordsState,
  action: Action
): ElementCoordsState {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, ...action.payload };
    case 'RESET':
      return {
        top: 0,
        left: 0,
        scrollTop: 0,
        scrollLeft: 0,
      };
    default:
      return state;
  }
}

export function useElementCoords(ref: RefObject<HTMLElement>) {
  const elementRef = ref?.current;
  const elementRect = elementRef?.getBoundingClientRect();

  const [state, dispatch] = useReducer(reducer, {
    top: elementRect?.top || 0,
    left: elementRect?.left || 0,
    scrollTop: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    dispatch({
      type: 'UPDATE',
      payload: {
        top: elementRect?.top || 0,
        left: elementRect?.left || 0,
        scrollTop: elementRef?.scrollTop || 0,
        scrollLeft: elementRef?.scrollLeft || 0,
      },
    });
  }, [elementRef, elementRect?.top, elementRect?.left]);

  return {
    state,
  };
}
