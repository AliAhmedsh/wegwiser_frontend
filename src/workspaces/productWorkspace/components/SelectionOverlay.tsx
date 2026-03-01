import { useEffect, useState, forwardRef, RefObject, useRef } from 'react';
import { useSlate } from 'slate-react';

import { useSelectionRects } from '../hooks/useSelectionRects';
import { useElementCoords } from '../hooks/useElementCoords';

import Utility from '../lib/utils';

type SelectionOverlayProps = {
  processing?: boolean;
};

const SelectionOverlay = forwardRef<HTMLElement, SelectionOverlayProps>(
  ({ processing = false }, ref) => {
    const editor = useSlate();
    const editorWrapper = (ref as RefObject<HTMLElement>)?.current;
    const editorWrapperRect = editorWrapper?.getBoundingClientRect();

    const [wrapperTop, setWrapperTop] = useState<number>(
      editorWrapperRect?.top || 0
    );
    const [wrapperLeft, setWrapperLeft] = useState<number>(
      editorWrapperRect?.left || 0
    );
    const [wrapperScrollLeft, setWrapperScrollLeft] = useState<number>(0);
    const [wrapperScrollTop, setWrapperScrollTop] = useState<number>(0);

    const { state: wrapperCoordsState } = useElementCoords(
      ref as RefObject<HTMLElement>
    );

    const [editorTextRects] = useSelectionRects(
      editor,
      Utility.rectHasVisibleText
    );
    const [lastSelectedRects, setLastSelectedRects] = useState<
      DOMRect[] | null
    >(null);
    const prevProcessingRef = useRef<boolean>(false);

    useEffect(() => {
      if (processing && !prevProcessingRef.current) {
        setWrapperTop(wrapperCoordsState.top);
        setWrapperLeft(wrapperCoordsState.left);
        setWrapperScrollLeft(wrapperCoordsState.scrollLeft);
        setWrapperScrollTop(wrapperCoordsState.scrollTop);
        setLastSelectedRects(editorTextRects);
      }
      if (!processing) {
        setLastSelectedRects(null);
      }

      prevProcessingRef.current = processing;
    }, [processing, editorTextRects, wrapperCoordsState]);

    if (!editorWrapper) return null;

    return (
      <>
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .gradient-bg-animated {
            background: linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%);
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
          }
        `}</style>

        <div
          className="pointer-events-none absolute inset-0 z-50"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {lastSelectedRects?.map((rect, i) => (
            <div
              key={`gradient-${i}`}
              className="pointer-events-none rounded absolute gradient-bg-animated"
              style={{
                top: rect.top - wrapperTop + wrapperScrollTop,
                left: rect.left - wrapperLeft + wrapperScrollLeft,
                width: rect.width,
                height: rect.height,
              }}
            />
          ))}
        </div>
      </>
    );
  }
);

SelectionOverlay.displayName = 'SelectionOverlay';

export default SelectionOverlay;
