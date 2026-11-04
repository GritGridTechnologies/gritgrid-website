"use client";

import { useEffect } from "react";

const revealTargets = [
  ".home-page .section-intro",
  ".home-page .about-note",
  ".home-page .service-card",
  ".home-page .project-card",
  ".home-page .portfolio-card",
  ".home-page .proof-row > div",
  ".home-page .process-step",
  ".home-page .principles > div",
  ".home-page .leaders > article",
  ".home-page .career-card",
  ".home-page .contact-layout > :first-child",
  ".section .section-intro",
  ".section .about-layout > *",
  ".services-grid > *",
  ".project-grid > *",
  ".portfolio-grid > *",
  ".tech-list > *",
  ".approach-grid > *",
  ".student-dashboard-grid > *",
  ".student-catalogue-grid > *",
  ".detail-layout > *",
  ".public-stats-grid > *",
].join(", ");

export function ScrollReveal() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(revealTargets),
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--motion-delay", `${(index % 4) * 70}ms`);
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        element.classList.remove("motion-reveal", "motion-revealed");
        element.style.removeProperty("--motion-delay");
      });
    };
  }, []);

  return null;
}
