import { useState, useEffect } from "react";

const API = "/deepfake/api";

export const useSystemStatus = () => {
  const [system, setSystem] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API}/system/status`);
        if (res.ok) {
          const data = await res.json();
          setSystem(data);
          setIsOnline(true);
        } else {
          setSystem(null);
          setIsOnline(false);
        }
      } catch {
        setSystem(null);
        setIsOnline(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return { system, isOnline };
};
