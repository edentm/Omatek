import { useRef, useEffect } from "react";

type CheckboxFilterProps = {
  type: "checkbox";
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
};

type DateRangeFilterProps = {
  type: "daterange";
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
};

type FilterButtonProps = {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
} & (CheckboxFilterProps | DateRangeFilterProps);

export default function FilterButton(props: FilterButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        props.onClose();
      }
    };
    if (props.isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [props.isOpen]);

  const isActive =
    props.type === "checkbox"
      ? props.selected.length > 0
      : !!(props.from || props.to);

  const toggleCheckbox = (value: string) => {
    if (props.type !== "checkbox") return;
    const next = props.selected.includes(value)
      ? props.selected.filter((v) => v !== value)
      : [...props.selected, value];
    props.onChange(next);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={props.onToggle}
        className={`h-[36px] px-4 border rounded-lg flex items-center gap-2 text-[14px] transition-colors ${
          isActive ? "border-black bg-gray-50 font-medium" : "border-[#d0d5dd]"
        }`}
      >
        {props.label}
        {props.type === "checkbox" && props.selected.length > 0 && (
          <span className="bg-black text-white text-[11px] rounded-full px-1.5 py-0.5 leading-none">
            {props.selected.length}
          </span>
        )}
        <svg
          className={`size-4 transition-transform ${props.isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {props.isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 bg-white border border-[#d0d5dd] rounded-lg shadow-lg z-50 min-w-[230px]">
          {props.type === "checkbox" ? (
            <div className="py-2">
              {props.options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={props.selected.includes(opt.value)}
                    onChange={() => toggleCheckbox(opt.value)}
                    className="size-4 rounded border-[#d0d5dd] accent-black cursor-pointer"
                  />
                  <span className="text-[14px] text-[#344054]">{opt.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-[12px] text-[#667085] mb-1 block">From</label>
                <input
                  type="date"
                  value={props.from}
                  onChange={(e) => props.onFromChange(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#d0d5dd] rounded-lg text-[14px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#667085] mb-1 block">To</label>
                <input
                  type="date"
                  value={props.to}
                  onChange={(e) => props.onToChange(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#d0d5dd] rounded-lg text-[14px]"
                />
              </div>
              {(props.from || props.to) && (
                <button
                  onClick={() => { props.onFromChange(""); props.onToChange(""); }}
                  className="text-[12px] text-[#667085] hover:text-black text-left"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
