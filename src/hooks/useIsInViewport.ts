import React, { useEffect, useState, useRef } from 'react';

const useIsInViewport = (): [React.RefObject<HTMLDivElement>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [isIn, setIsIn] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIn(!entry.isIntersecting && (entry.boundingClientRect.top > 0 || entry.boundingClientRect.bottom < 0));
      },
      {
        threshold: 0, // Trigger when any part of the element enters/exits the viewport
      }
    );

    const element = ref.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return [ref, isIn];
};

export default useIsInViewport