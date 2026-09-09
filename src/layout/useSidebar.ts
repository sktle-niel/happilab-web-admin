import { useCallback, useEffect, useState } from "react";

const KEY = "happilab-admin.sidebar";

const readHidden = () => {
  try {
    return localStorage.getItem(KEY) === "hidden";
  } catch {
    return false;
  }
};

/** Whether the sidebar is tucked away, remembered across visits. */
export function useSidebar() {
  const [hidden, setHidden] = useState(readHidden);
  const toggle = useCallback(() => setHidden((was) => !was), []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, hidden ? "hidden" : "open");
    } catch {
      // A browser that refuses storage still gets the toggle, only not the memory.
    }
  }, [hidden]);

  return { hidden, toggle };
}
