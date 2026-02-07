"use client";

import { useState } from "react";
import { categories } from "@/lib/game/categories";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function CategorySelector({
  selectedCategory,
  onSelect,
}: CategorySelectorProps) {
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomConfirm = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      onSelect(trimmed);
      setShowCustom(false);
    }
  };

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
      <label className="block text-sm text-[var(--text-muted)] mb-3">
        카테고리:{" "}
        <span className="text-white font-bold">{selectedCategory || "랜덤"}</span>
      </label>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onSelect("")}
          className={`px-2 py-1.5 text-xs rounded-lg transition-all active:scale-95
            ${
              selectedCategory === ""
                ? "bg-[var(--accent)] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
        >
          랜덤
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-2 py-1.5 text-xs rounded-lg transition-all active:scale-95
              ${
                selectedCategory === cat
                  ? "bg-[var(--accent)] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-2 py-1.5 text-xs rounded-lg transition-all active:scale-95
            ${
              showCustom ||
              (selectedCategory && !categories.includes(selectedCategory))
                ? "bg-[var(--accent)] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
        >
          직접 입력
        </button>
      </div>

      {showCustom && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomConfirm()}
            placeholder="카테고리 입력"
            maxLength={10}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg
                       text-white text-sm placeholder:text-white/30 outline-none
                       focus:border-[var(--accent)] transition-all"
          />
          <button
            onClick={handleCustomConfirm}
            className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg
                       hover:bg-[var(--accent)]/80 transition-all active:scale-95"
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
}
