"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gritgrid-student-mode-hint-dismissed";

export function StudentDiscoveryHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // The hint remains functional when storage is unavailable.
    }
  };

  if (!visible) return null;

  return (
    <aside className="student-discovery-hint" aria-label="Student mode discovery hint">
      <button className="hint-dismiss" type="button" aria-label="Dismiss student mode hint" onClick={dismiss}>×</button>
      <p>🎓 Student? <span>Explore your space here</span></p>
      <svg className="hint-arrow" viewBox="0 0 86 68" aria-hidden="true">
        <path d="M8 8 C38 10, 70 23, 59 53" />
        <path d="M59 53 L47 45 M59 53 L61 38" />
      </svg>
    </aside>
  );
}

export { STORAGE_KEY as STUDENT_HINT_STORAGE_KEY };
