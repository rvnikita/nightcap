"use client";

import { useEffect, useState } from "react";

const COUNT = 8;

// Arrow-key / space navigation between slides, plus a progress rail.
export function DeckNav() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const go = (i: number) => {
      const idx = Math.max(0, Math.min(COUNT - 1, i));
      document.getElementById(`s${idx + 1}`)?.scrollIntoView({ behavior: "smooth" });
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(active + 1);
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(active - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(COUNT - 1);
      }
    };

    const sections = Array.from({ length: COUNT }, (_, i) => document.getElementById(`s${i + 1}`));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const i = sections.findIndex((s) => s === en.target);
            if (i >= 0) setActive(i);
          }
        });
      },
      { threshold: 0.5 },
    );
    sections.forEach((s) => s && obs.observe(s));

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      obs.disconnect();
    };
  }, [active]);

  return (
    <nav className="deck-nav fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-2.5 md:flex">
      {Array.from({ length: COUNT }, (_, i) => (
        <a
          key={i}
          href={`#s${i + 1}`}
          aria-label={`Slide ${i + 1}`}
          className={`h-2 w-2 rounded-full transition ${
            i === active ? "scale-125 bg-rain" : "bg-paper/25 hover:bg-paper/50"
          }`}
        />
      ))}
    </nav>
  );
}
