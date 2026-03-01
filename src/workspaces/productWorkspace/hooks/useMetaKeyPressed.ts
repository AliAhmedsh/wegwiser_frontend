import { useEffect, useState } from 'react';

export const useMetaKeyPressed = (): [boolean] => {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.metaKey) setIsPressed(true);
    };

    const upHandler = (e: KeyboardEvent) => {
      if (!e.metaKey) setIsPressed(false);
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  return [isPressed];
};
