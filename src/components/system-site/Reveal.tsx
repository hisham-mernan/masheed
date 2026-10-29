"use client";

import { useEffect } from "react";

// Entrances for the parts of each section (.rv, staggered by --i). Content is visible without
// script: the hiding class goes on <html> only here, and parts rendered later (filtered lists,
// swapped panels) are picked up by the mutation observer. Reduced motion skips it entirely.
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    const watch = (n: ParentNode) => n.querySelectorAll(".rv:not(.is-in)").forEach((el) => io.observe(el));
    watch(document);
    root.classList.add("rv-on");
    const mo = new MutationObserver((list) => {
      for (const m of list) m.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        if (n.matches(".rv:not(.is-in)")) io.observe(n);
        watch(n);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); root.classList.remove("rv-on"); };
  }, []);
  return null;
}
