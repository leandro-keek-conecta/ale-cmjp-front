import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToTop = (target?: HTMLElement | null) => {
  if (!target) return;
  try {
    target.scrollTo({ top: 0, left: 0, behavior: "auto" });
  } catch {
    target.scrollTop = 0;
    target.scrollLeft = 0;
  }
};

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    scrollToTop(document.documentElement);
    scrollToTop(document.body);
    scrollToTop(document.querySelector<HTMLElement>("main"));
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}
