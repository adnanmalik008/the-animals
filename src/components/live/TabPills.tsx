"use client";

/* Segmented pill switcher shared by the right-column modules.
   Toggle-button semantics (aria-pressed) rather than the ARIA tabs
   pattern — these switch datasets in place, not labelled panels. */
export function TabPills<T extends string>({
  items,
  active,
  onChange,
  label,
}: {
  items: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="ml-auto flex items-center gap-1 rounded-full border border-line bg-card p-1 shadow-sm"
    >
      {items.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(t.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 ${
              isActive ? "bg-orange text-white" : "text-graphite hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
