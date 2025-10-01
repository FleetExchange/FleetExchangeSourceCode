"use client";
import { useState, useEffect, useCallback, useRef } from "react";

type TruckOption = { value: string; label: string };
type TruckGroup = { label: string; options: TruckOption[] };

const groups: TruckGroup[] = [
  {
    label: "Small",
    options: [
      { value: "Panel Van", label: "Panel Van" },
      { value: "Bakkie", label: "Bakkie" },
      { value: "Bakkie with canopy", label: "Bakkie with canopy" },
      { value: "Small Dropside", label: "Small Dropside" },
      { value: "Small Flatbed", label: "Small Flatbed" },
      { value: "Refrigerated Van", label: "Refrigerated Van" },
    ],
  },
  {
    label: "Rigid",
    options: [
      { value: "Box Body Rigid", label: "Box Body Rigid" },
      { value: "Curtainside Rigid", label: "Curtainside Rigid" },
      { value: "Dropside Rigid", label: "Dropside Rigid" },
      { value: "Flatbed Rigid", label: "Flatbed Rigid" },
      { value: "Refrigerated Rigid", label: "Refrigerated Rigid" },
      { value: "Tipper Rigid", label: "Tipper Rigid" },
      { value: "Tanker Rigid", label: "Tanker Rigid" },
      { value: "Logging Rigid", label: "Logging Rigid" },
      { value: "Car Carrier Rigid", label: "Car Carrier Rigid" },
      { value: "Livestock Rigid", label: "Livestock Rigid" },
    ],
  },
  {
    label: "Semi",
    options: [
      { value: "Flatbed Semi", label: "Flatbed Semi" },
      { value: "Curtainside Semi", label: "Curtainside Semi" },
      { value: "Box Semi", label: "Box Semi" },
      { value: "Refrigerated Semi", label: "Refrigerated Semi" },
      { value: "Lowbed Semi", label: "Lowbed Semi" },
      { value: "Tipper Semi", label: "Tipper Semi" },
      { value: "Tanker Semi", label: "Tanker Semi" },
      {
        value: "Container Trailer (Skeletal)",
        label: "Container Trailer (Skeletal)",
      },
      { value: "Side Lifter Semi", label: "Side Lifter Semi" },
      { value: "Livestock Semi", label: "Livestock Semi" },
      { value: "Car Carrier Semi", label: "Car Carrier Semi" },
      { value: "Logging Semi", label: "Logging Semi" },
    ],
  },
  {
    label: "Interlink",
    options: [
      { value: "Flatbed Interlink", label: "Flatbed Interlink" },
      { value: "Curtainside Interlink", label: "Curtainside Interlink" },
      { value: "Box Interlink", label: "Box Interlink" },
      { value: "Refrigerated Interlink", label: "Refrigerated Interlink" },
      { value: "Lowbed Interlink", label: "Lowbed Interlink" },
      { value: "Tipper Interlink", label: "Tipper Interlink" },
      { value: "Tanker Interlink", label: "Tanker Interlink" },
      {
        value: "Container Interlink (skeletal)",
        label: "Container Interlink (skeletal)",
      },
      { value: "Livestock Interlink", label: "Livestock Interlink" },
      { value: "Car Carrier Interlink", label: "Car Carrier Interlink" },
      { value: "Logging Interlink", label: "Logging Interlink" },
    ],
  },
];

export function TruckSelector({
  value,
  onChange,
  placeholder = "Select truck type",
  disabled = false,
  className = "",
  searchable = true,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // default expand first group
  useEffect(() => {
    if (Object.keys(expanded).length === 0) {
      setExpanded({ [groups[0].label]: true });
    }
  }, [expanded]);

  const flatOptions = groups.flatMap((g) => g.options);
  const currentLabel = flatOptions.find((o) => o.value === value)?.label;

  const filteredGroups = groups
    .map((g) => ({
      ...g,
      options: g.options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.options.length > 0);

  // close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const toggleGroup = (label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (["ArrowDown", "Enter", " "].includes(e.key)) {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key === "Tab") setOpen(false);
    },
    [open]
  );

  return (
    <div ref={containerRef} className={`relative w-50 ${className}`}>
      {/* Trigger styled to match other inputs/selects (height, font, spacing) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`h-10 w-full inline-flex items-center justify-between rounded-md border border-base-300 bg-base-100 px-3 text-sm text-base-content shadow-sm
          transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={currentLabel ? "" : "text-base-content/50"}>
          {currentLabel || placeholder}
        </span>
        <span
          className={`ml-2 transition-transform duration-150 text-base-content/60`}
        >
          <svg
            className={`w-4 h-4 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-base-300 bg-base-100 shadow-lg ring-1 ring-black/5 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-base-200">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-8 text-sm rounded-md bg-base-200/60 px-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          <ul
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-auto py-1 focus:outline-none scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent"
          >
            {filteredGroups.length === 0 && (
              <li className="px-3 py-3 text-sm text-base-content/50">
                No matches
              </li>
            )}
            {filteredGroups.map((group) => {
              const isOpen = expanded[group.label];
              return (
                <li key={group.label} className="select-none">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold tracking-wide uppercase text-base-content/70 hover:bg-base-200/70"
                  >
                    {group.label}
                    <svg
                      className={`w-3 h-3 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <ul className="pb-1">
                      {group.options.map((opt) => {
                        const selected = opt.value === value;
                        return (
                          <li key={opt.value}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => handleSelect(opt.value)}
                              className={`w-full text-left px-6 py-2 text-sm transition-colors
                                hover:bg-primary/10 hover:text-primary
                                ${
                                  selected
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-base-content/80"
                                }`}
                            >
                              {opt.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="h-px bg-base-200 last:hidden" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
