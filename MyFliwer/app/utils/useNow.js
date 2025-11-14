import { useEffect, useState } from "react";

export function useNow(active) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  return now;
}
