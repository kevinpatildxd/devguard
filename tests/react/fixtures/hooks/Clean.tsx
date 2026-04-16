import { useState, useEffect, useCallback } from 'react';

export function ValidComponent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [data, setData] = useState(null); // top-level — valid
  useEffect(() => {}, []);                // top-level — valid
  return null;
}

export function useCustomHook() {
  const [val, setVal] = useState(0); // valid — custom hook caller
  return val;
}
