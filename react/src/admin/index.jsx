import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './style.css';

const PAGE_SIZE = 20;

const sections = {
  books: {
    label: '书籍管理',
    endpoint: '/api/admin/books',
    columns: [
      { key: 'id', label: '编号', width: '72px' },
      { key: 'name', label: '书名', primary: true },
      { key: 'author', label: '作者' },
      { key: 'tag', label: '标签' },
      { key: 'size', label: '字数', format: (value) => value ? Number(value).toLocaleString('zh-CN') : '—' },
      { key: 'price', label: '价格', format: (value) => value == null ? '—' : `¥${value}` },
    ],
  },
  users: {
    label: '用户管理',
    endpoint: '/api/admin/users',
    columns: [
      { key: 'id', label: '编号', width: '72px' },
      { key: 'name', label: '用户名', primary: true },
      { key: 'email', label: '邮箱' },
      { key: 'role', label: '角色', format: (value) => value || '用户' },
    ],
  },
  comments: {
    label: '评论管理',
    endpoint: '/api/admin/comments',
    columns: [
      { key: 'id', label: '编号', width: '72px' },
      { key: 'detail', label: '评论内容', primary: true },
      { key: 'author', label: '作者' },
      { key: 'book_id', label: '书籍编号' },
      { key: 'created_at', label: '发布时间', format: formatDate },
    ],
  },
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-CN');
}

function AdminApp() {
  const [sectionKey, setSectionKey] = useState('books');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const section = sections[sectionKey];
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    axios.get(section.endpoint, {
      params: { page, pageSize: PAGE_SIZE },
      signal: controller.signal,
    }).then(({ data }) => {
      setRecords(data.data);
      setTotal(data.total);
    }).catch((requestError) => {
      if (!axios.isCancel(requestError)) {
        setError(requestError.response?.data?.error_message || '暂时无法加载数据，请稍后重试。');
        setRecords([]);
        setTotal(0);
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [section.endpoint, page]);

  function selectSection(key) {
    setSectionKey(key);
    setPage(1);
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" aria-label="返回首页">
          <span className="brand-mark">N</span>
          <span>Novel<span className="brand-caption">STUDIO / ADMIN</span></span>
        </a>
        <nav className="admin-nav" aria-label="管理导航">
          {Object.entries(sections).map(([key, item], index) => (
            <button
              className={`nav-item${sectionKey === key ? ' active' : ''}`}
              key={key}
              onClick={() => selectSection(key)}
              type="button"
            >
              <span className="nav-index">0{index + 1}</span>
              <span>{item.label}</span>
              {sectionKey === key && <span className="nav-current" aria-hidden="true" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" /> 内容管理系统
          <span className="sidebar-version">ADMIN / 01</span>
        </div>
      </aside>

      <section className="admin-content">
        <header className="content-topbar">
          <div className="breadcrumb">工作台 <span>/</span> {section.label}</div>
          <a className="site-link" href="/">返回阅读站 <span aria-hidden="true">↗</span></a>
        </header>

        <div className="content-inner">
          <div className="page-heading">
            <div>
              <h1>{section.label}</h1>
              <p>浏览与管理平台中的{section.label.slice(0, -2)}记录。</p>
            </div>
            <div className="record-summary">
              <span className="summary-label">记录总数</span>
              <strong>{total.toLocaleString('zh-CN')}</strong>
              <span className="summary-unit">条</span>
            </div>
          </div>

          <div className="table-frame">
            <div className="table-toolbar">
              <div><span className="live-indicator" /> 当前列表</div>
              <span>每页 {PAGE_SIZE} 条</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>{section.columns.map((column) => <th key={column.key} style={{ width: column.width }}>{column.label}</th>)}</tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="table-message" colSpan={section.columns.length}>正在读取记录…</td></tr>
                  ) : error ? (
                    <tr><td className="table-message error-message" colSpan={section.columns.length}>{error}</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td className="table-message" colSpan={section.columns.length}>这里还没有记录</td></tr>
                  ) : records.map((record) => (
                    <tr key={record.id}>
                      {section.columns.map((column) => {
                        const value = record[column.key];
                        const displayValue = column.format ? column.format(value) : value ?? '—';
                        return (
                          <td className={column.primary ? 'primary-cell' : ''} key={column.key} title={String(displayValue)}>
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="pagination-bar">
              <span className="pagination-count">
                {total === 0 ? '显示 0 条记录' : `显示 ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} 条，共 ${total} 条`}
              </span>
              <div className="pagination-controls">
                <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>上一页</button>
                <span className="page-indicator"><strong>{page}</strong><span>/</span>{pageCount}</span>
                <button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)}>下一页</button>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('react-app')).render(<AdminApp />);
