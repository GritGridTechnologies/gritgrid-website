"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const gritGridLogo =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-R9kMzItDuu3i4AlQdfGLt58rqu31QK.png";

export function TechnologyVisual() {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => panel.classList.toggle("is-in-view", entry.isIntersecting),
      { threshold: 0.16, rootMargin: "0px 0px -24px 0px" },
    );

    observer.observe(panel);
    return () => {
      observer.disconnect();
      panel.classList.remove("is-in-view");
    };
  }, []);

  function updatePointerTilt(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    event.currentTarget.style.setProperty(
      "--tilt-x",
      `${(-y * 2.2).toFixed(2)}deg`,
    );
    event.currentTarget.style.setProperty(
      "--tilt-y",
      `${(x * 2.8).toFixed(2)}deg`,
    );
    event.currentTarget.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
  }

  function resetPointerTilt(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
    event.currentTarget.style.removeProperty("--spot-x");
    event.currentTarget.style.removeProperty("--spot-y");
  }

  return (
    <div
      ref={panelRef}
      className="hero-visual signal-panel technology-visual"
      role="img"
      aria-label="GritGrid technology illustration connecting AI, data, software and cloud around the company logo"
      onPointerMove={updatePointerTilt}
      onPointerLeave={resetPointerTilt}
    >
      <div className="signal-top">
        <span className="signal-top-label">
          <span className="signal-marker" aria-hidden="true" />
          GRITGRID / SYSTEMS THINKING
        </span>
        <span className="signal-top-index">GG / 01</span>
      </div>

      <div className="signal-core">
        <div className="signal-grid" aria-hidden="true" />
        <svg className="signal-circuit" viewBox="0 0 600 430" aria-hidden="true">
          <path className="circuit-line circuit-line-one" d="M38 76 H136 V136 H230" />
          <path className="circuit-line circuit-line-two" d="M562 76 H464 V136 H370" />
          <path className="circuit-line circuit-line-accent circuit-line-three" d="M34 215 H204" />
          <path className="circuit-line circuit-line-four" d="M566 215 H396" />
          <path className="circuit-line circuit-line-five" d="M38 352 H136 V292 H230" />
          <path className="circuit-line circuit-line-six" d="M562 352 H464 V292 H370" />
          <path className="circuit-line circuit-line-seven" d="M300 18 V116" />
          <path className="circuit-line circuit-line-accent circuit-line-eight" d="M300 412 V314" />
          <circle className="signal-point" cx="38" cy="76" r="3" />
          <circle className="signal-point signal-point-accent" cx="136" cy="136" r="3" />
          <circle className="signal-point" cx="562" cy="76" r="3" />
          <circle className="signal-point signal-point-accent" cx="464" cy="136" r="3" />
          <circle className="signal-point signal-point-accent" cx="34" cy="215" r="3" />
          <circle className="signal-point" cx="566" cy="215" r="3" />
          <circle className="signal-point" cx="38" cy="352" r="3" />
          <circle className="signal-point signal-point-accent" cx="562" cy="352" r="3" />
        </svg>

        <div className="core-ring ring-three" aria-hidden="true" />
        <div className="core-ring ring-two" aria-hidden="true" />
        <div className="core-ring ring-one" aria-hidden="true" />

        <div className="signal-chip signal-chip-one" aria-hidden="true">
          <span>01</span>
          <strong>AI &amp; data</strong>
        </div>
        <div className="signal-chip signal-chip-two" aria-hidden="true">
          <span>02</span>
          <strong>Software</strong>
        </div>
        <div className="signal-chip signal-chip-three" aria-hidden="true">
          <span>03</span>
          <strong>Cloud systems</strong>
        </div>

        <div className="signal-core-brand" aria-hidden="true">
          <div className="core-node">
            <Image src={gritGridLogo} alt="" width={56} height={56} priority />
          </div>
          <span>GritGrid</span>
          <small>TECHNOLOGIES</small>
        </div>
      </div>

      <div className="signal-bottom">
        <span className="signal-bottom-label">Ideas into useful systems</span>
        <span className="signal-bottom-sequence">DESIGN <i /> BUILD <i /> IMPROVE</span>
      </div>
    </div>
  );
}
