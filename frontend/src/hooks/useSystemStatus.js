import { useState, useEffect } from "react";

const API = "/api";

export const useSystemStatus = () => {
  const [system, setSystem] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setSystem(null);
        setIsOnline(false);
        setChecked(false);
        return;
      }
      try {
        const res = await fetch(`${API}/system/status`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
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
      } finally {
        setChecked(true);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // checked=false means we never attempted a real check (no auth token yet) —
  // that's not the same as a confirmed offline cluster.
  return { system, isOnline, checked };
};
