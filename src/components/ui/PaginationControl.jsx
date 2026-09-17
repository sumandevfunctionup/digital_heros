"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function PaginationControl({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  limitOptions = [10, 20, 50, 100],
  onPageChange,
  onLimitChange,
  itemName = "items",
  className = "",
}) {
  const safeCurrentPage = Math.max(1, currentPage);
  const safeTotalPages = Math.max(1, totalPages);

  // Range calculation
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const endItem = Math.min(safeCurrentPage * limit, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", safeTotalPages];
    }

    if (safeCurrentPage >= safeTotalPages - 3) {
      return [
        1,
        "...",
        safeTotalPages - 4,
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages,
      ];
    }

    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      safeTotalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs font-mono text-white/70 ${className}`}
    >
      {/* Left: Summary and Limit Selector */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="text-white/50">
          Showing <strong className="text-white font-bold">{startItem}</strong>–
          <strong className="text-white font-bold">{endItem}</strong> of{" "}
          <strong className="text-amber-400 font-bold">{totalItems}</strong> {itemName}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-white/40 text-[11px]">Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                onLimitChange(newLimit);
              }}
              className="bg-[#121522] border border-white/15 text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-amber-500/50 cursor-pointer transition-colors"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#121522] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
        {/* First Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          aria-label="First page"
          className="p-1.5 rounded-lg border border-white/10 bg-[#121522] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-white/10 bg-[#121522] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-white/30 select-none text-xs"
                >
                  •••
                </span>
              );
            }

            const isCurrent = p === safeCurrentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange && onPageChange(p)}
                className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? "bg-amber-500 text-black border border-amber-400 shadow-md shadow-amber-500/20"
                    : "border border-white/10 bg-[#121522] hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-white/10 bg-[#121522] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(safeTotalPages)}
          disabled={safeCurrentPage >= safeTotalPages}
          aria-label="Last page"
          className="p-1.5 rounded-lg border border-white/10 bg-[#121522] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
