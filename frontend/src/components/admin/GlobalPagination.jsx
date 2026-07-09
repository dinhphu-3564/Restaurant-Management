// GlobalPagination.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { usePagination, DOTS } from "./usePagination";
import "./GlobalPagination.css";

const translations = {
  vi: {
    showing: "Hiển thị",
    of: "trong số",
    results: "kết quả",
    perPage: "Mỗi trang",
    noData: "Không có dữ liệu",
    prev: "Trước",
    next: "Sau",
  },
  en: {
    showing: "Showing",
    of: "of",
    results: "results",
    perPage: "Per page",
    noData: "No data available",
    prev: "Prev",
    next: "Next",
  },
};

export default function GlobalPagination({
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  isLoading = false,
  limitOptions = [10, 20, 50, 100, 200, 500],
  syncToUrl = false,
  showQuickJump = false,
  lang = "vi",
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const t = translations[lang] || translations.vi;

  const currentPage = syncToUrl
    ? parseInt(searchParams.get("page") || String(page), 10) || 1
    : page;

  const pageSize = syncToUrl
    ? parseInt(searchParams.get("limit") || String(limit), 10) || 20
    : limit;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Sync to URL if enabled
  useEffect(() => {
    if (syncToUrl) {
      const currentUrlPage = parseInt(searchParams.get("page"), 10);
      const currentUrlLimit = parseInt(searchParams.get("limit"), 10);

      if (currentUrlPage !== currentPage || currentUrlLimit !== pageSize) {
        setSearchParams(
          (prev) => {
            prev.set("page", String(currentPage));
            prev.set("limit", String(pageSize));
            return prev;
          },
          { replace: true }
        );
      }
    }
  }, [currentPage, pageSize, syncToUrl, searchParams, setSearchParams]);

  const paginationRange = usePagination({
    totalCount: total,
    pageSize: pageSize,
    siblingCount: 1,
    currentPage: currentPage,
  });

  const handlePageSelect = (pageNumber) => {
    if (pageNumber === currentPage || pageNumber < 1 || pageNumber > totalPages || isLoading) return;
    if (syncToUrl) {
      setSearchParams((prev) => {
        prev.set("page", String(pageNumber));
        return prev;
      });
    }
    onPageChange(pageNumber);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    if (newLimit === pageSize || isLoading) return;
    if (syncToUrl) {
      setSearchParams((prev) => {
        prev.set("limit", String(newLimit));
        prev.set("page", "1");
        return prev;
      });
    }
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
    onPageChange(1);
  };

  const [jumpPage, setJumpPage] = useState("");
  const handleQuickJump = (e) => {
    if (e.key === "Enter") {
      const pageNum = parseInt(jumpPage, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        handlePageSelect(pageNum);
        setJumpPage("");
      }
    }
  };

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  // Mounted check for Hydration Mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="global-pagination-placeholder h-12" />;
  }

  return (
    <nav className="global-pagination-container" aria-label="Table pagination">
      {/* Left section: Stats */}
      <div className="pagination-stats">
        {total === 0
          ? t.noData
          : `${t.showing} ${from} - ${to} ${t.of} ${total} ${t.results}`}
      </div>

      {/* Right section: Controls */}
      <div className="pagination-actions">
        {/* Limit Selector */}
        {onLimitChange && (
          <div className="pagination-limit-wrapper">
            <span className="limit-label">{t.perPage}:</span>
            <select
              value={pageSize}
              onChange={handleLimitChange}
              disabled={isLoading}
              className="pagination-select"
              aria-label="Select records per page"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Jump */}
        {showQuickJump && totalPages > 1 && (
          <div className="pagination-quickjump">
            <input
              type="text"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleQuickJump}
              placeholder="Đi..."
              disabled={isLoading}
              className="quickjump-input"
              aria-label="Quick jump to page"
            />
          </div>
        )}

        {/* Navigation buttons */}
        <ul className="pagination-buttons">
          <li>
            <button
              onClick={() => handlePageSelect(1)}
              disabled={currentPage === 1 || isLoading}
              className="pag-btn"
              aria-label="First page"
            >
              <ChevronsLeft size={16} />
            </button>
          </li>
          <li>
            <button
              onClick={() => handlePageSelect(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="pag-btn"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
          </li>

          {paginationRange.map((pageNumber, idx) => {
            if (pageNumber === DOTS) {
              return (
                <li key={`dots-${idx}`}>
                  <span className="pag-ellipsis">&#8230;</span>
                </li>
              );
            }

            return (
              <li key={pageNumber}>
                <button
                  onClick={() => handlePageSelect(pageNumber)}
                  disabled={isLoading}
                  className={`pag-btn ${
                    pageNumber === currentPage ? "pag-btn-active" : ""
                  }`}
                >
                  {pageNumber}
                </button>
              </li>
            );
          })}

          <li>
            <button
              onClick={() => handlePageSelect(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="pag-btn"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </li>
          <li>
            <button
              onClick={() => handlePageSelect(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className="pag-btn"
              aria-label="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
