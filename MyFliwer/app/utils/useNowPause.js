import { useEffect, useState } from "react";

export function useNowPause(active) {
  const [nowPause, setNowPause] = useState(Date.now());

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setNowPause(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  return nowPause;
}
