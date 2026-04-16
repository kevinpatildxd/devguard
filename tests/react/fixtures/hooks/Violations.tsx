import { useState, useEffect } from 'react';

export function ConditionalHook({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    const [data, setData] = useState(null); // violation: hook in conditional
  }
  return null;
}

export function LoopHook({ items }: { items: string[] }) {
  for (let i = 0; i < items.length; i++) {
    useEffect(() => {}, []); // violation: hook in loop
  }
  return null;
}

export function NestedFunctionHook() {
  function inner() {
    const [x, setX] = useState(0); // violation: hook in nested function
  }
  return null;
}

export function regularFunctionCallingHook() {
  const [val, setVal] = useState(0); // violation: non-component, non-hook caller
  return val;
}
