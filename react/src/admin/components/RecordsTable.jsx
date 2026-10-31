import React from 'react';
import Pagination from './Pagination';

export default function RecordsTable({ section, sectionKey, records, total, page, pageSize, loading, error, onPageChange, onBookSelect }) {
  return (
    <>
      <div className="page-heading">
        <div><h1>{section.label}</h1><p>浏览与管理平台中的{section.label.slice(0, -2)}记录。</p></div>
        <div className="record-summary"><span className="summary-label">记录总数</span><strong>{total.toLocaleString('zh-CN')}</strong><span className="summary-unit">条</span></div>
      </div>
      <div className="table-frame">
        <div className="table-toolbar"><div><span className="live-indicator" /> 当前列表</div><span>每页 {pageSize} 条</span></div>
        <div className="table-scroll">
          <table>
            <thead><tr>{section.columns.map((column) => <th key={column.key} style={{ width: column.width }}>{column.label}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td className="table-message" colSpan={section.columns.length}>正在读取记录…</td></tr>
                : error ? <tr><td className="table-message error-message" colSpan={section.columns.length}>{error}</td></tr>
                  : !records.length ? <tr><td className="table-message" colSpan={section.columns.length}>这里还没有记录</td></tr>
                    : records.map((record) => (
                      <tr className={sectionKey === 'books' ? 'book-row' : ''} key={record.id} onClick={sectionKey === 'books' ? () => onBookSelect(record) : undefined}>
                        {section.columns.map((column) => {
                          const value = record[column.key];
                          const displayValue = column.format ? column.format(value) : value ?? '—';
                          return (
                            <td className={column.primary ? 'primary-cell' : ''} key={column.key} title={String(displayValue)}>
                              {column.primary && sectionKey === 'books'
                                ? <button className="book-title-button" onClick={(event) => { event.stopPropagation(); onBookSelect(record); }} type="button">{displayValue}<span>查看统计 ↗</span></button>
                                : displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} loading={loading} onPageChange={onPageChange} />
      </div>
    </>
  );
}
