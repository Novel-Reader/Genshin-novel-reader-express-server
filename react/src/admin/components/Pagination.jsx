import React from 'react';

export default function Pagination({ page, total, pageSize, loading, onPageChange, label = '条' }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const range = total ? `显示 ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} 条，共 ${total} 条` : `显示 0 ${label}`;

  return (
    <footer className="pagination-bar">
      <span className="pagination-count">{range}</span>
      <div className="pagination-controls">
        <button type="button" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>上一页</button>
        <span className="page-indicator">
          <strong>{page}</strong><span>/</span>{pageCount}
        </span>
        <button type="button" disabled={page >= pageCount || loading} onClick={() => onPageChange(page + 1)}>下一页</button>
      </div>
    </footer>
  );
}
