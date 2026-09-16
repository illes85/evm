import { useRef, useState } from "react";
import type { Project } from "../../types/domain";
import { PROJECT_STATUSES } from "../../lib/projectStatus";
import { ProjectCard } from "./ProjectCard";
import { cx } from "../../lib/cx";

export function ProjectKanban({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const byStatus = PROJECT_STATUSES.map((status) => ({
    status,
    items: projects.filter((p) => p.status === status.id),
  }));

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const columnWidth = el.firstElementChild?.clientWidth ?? 1;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (columnWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), PROJECT_STATUSES.length - 1));
  }

  function scrollToIndex(index: number) {
    const el = trackRef.current;
    const column = el?.children[index] as HTMLElement | undefined;
    if (el && column) {
      el.scrollTo({ left: column.offsetLeft - el.offsetLeft, behavior: "smooth" });
    }
  }

  return (
    <div>
      <div className="flex justify-center gap-1.5 pb-3 md:hidden">
        {PROJECT_STATUSES.map((status, i) => (
          <button
            key={status.id}
            aria-label={`Ugrás: ${status.label}`}
            onClick={() => scrollToIndex(i)}
            className={cx(
              "h-1.5 rounded-full transition-all",
              i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar snap-x-mandatory md:snap-none flex gap-4 overflow-x-auto px-4 pb-4 md:px-6"
      >
        {byStatus.map(({ status, items }) => (
          <div
            key={status.id}
            className="snap-center shrink-0 w-[88vw] sm:w-80 md:w-72"
          >
            <div className="mb-3 flex items-center gap-2 px-0.5">
              <span className={`size-2 rounded-full ${status.dot}`} />
              <h3 className="text-sm font-semibold">{status.label}</h3>
              <span className="text-xs text-text-muted">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-text-muted">
                  Nincs projekt ebben az állapotban
                </div>
              ) : (
                items.map((project) => <ProjectCard key={project.id} project={project} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
