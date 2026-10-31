import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import AdminSidebar from './components/AdminSidebar';
import BookStatistics from './components/BookStatistics';
import RecordsTable from './components/RecordsTable';
import StatisticsOverview from './components/StatisticsOverview';
import './style.css';

const PAGE_SIZE = 20;
const token = document.cookie.match(/(?:^|;\s*)novelToken=([^;]*)/)?.[1];
const api = axios.create({
  headers: {
    Authorization: `Bearer ${token ? decodeURIComponent(token) : ''}`,
  },
});

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
      { key: 'download_count', label: '阅读量', format: (value) => Number(value || 0).toLocaleString('zh-CN') },
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

const navigation = [
  { key: 'overview', label: '统计概览' },
  ...Object.entries(sections).map(([key, section]) => ({ key, label: section.label })),
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-CN');
}

function AdminApp() {
  const [sectionKey, setSectionKey] = useState('overview');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [bookId, setBookId] = useState(null);
  const [bookPage, setBookPage] = useState(1);
  const [bookStatistics, setBookStatistics] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');
  const section = sections[sectionKey];
  const activeNavigation = navigation.find((item) => item.key === sectionKey);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const request = sectionKey === 'overview'
      ? api.get('/api/admin/statistics', { signal: controller.signal })
      : api.get(section.endpoint, { params: { page, pageSize: PAGE_SIZE }, signal: controller.signal });

    request.then(({ data }) => {
      if (sectionKey === 'overview') setStatistics(data);
      else {
        setRecords(data.data);
        setTotal(data.total);
      }
    }).catch((requestError) => {
      if (!axios.isCancel(requestError)) {
        setError(requestError.response?.data?.error_message || '暂时无法加载数据，请稍后重试。');
        if (sectionKey === 'overview') setStatistics(null);
        else {
          setRecords([]);
          setTotal(0);
        }
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [sectionKey, page]);

  useEffect(() => {
    if (bookId == null) return undefined;
    const controller = new AbortController();
    setBookLoading(true);
    setBookError('');
    api.get('/api/admin/book-statistics', {
      params: { book_id: bookId, page: bookPage, pageSize: PAGE_SIZE },
      signal: controller.signal,
    }).then(({ data }) => setBookStatistics(data)).catch((requestError) => {
      if (!axios.isCancel(requestError)) {
        setBookError(requestError.response?.data?.error_message || '暂时无法加载书籍统计。');
      }
    }).finally(() => {
      if (!controller.signal.aborted) setBookLoading(false);
    });
    return () => controller.abort();
  }, [bookId, bookPage]);

  function selectSection(key) {
    setSectionKey(key);
    setPage(1);
    setBookId(null);
    setBookStatistics(null);
  }

  function openBookStatistics(book) {
    setBookId(book.id);
    setBookPage(1);
    setBookStatistics(null);
    setBookError('');
  }

  const detailBook = bookStatistics?.book || records.find((record) => record.id === bookId);
  const title = bookId == null ? activeNavigation.label : '书籍统计';

  return (
    <main className="admin-shell">
      <AdminSidebar navigation={navigation} activeKey={sectionKey} detailOpen={bookId != null} onSelect={selectSection} />
      <section className="admin-content">
        <header className="content-topbar">
          <div className="breadcrumb">工作台 <span>/</span> {title}{detailBook && <> <span>/</span> {detailBook.name}</>}</div>
          <a className="site-link" href="/">返回阅读站 <span aria-hidden="true">↗</span></a>
        </header>
        <div className="content-inner">
          {bookId != null ? (
            <BookStatistics
              book={detailBook}
              statistics={bookStatistics}
              page={bookPage}
              pageSize={PAGE_SIZE}
              loading={bookLoading}
              error={bookError}
              onPageChange={setBookPage}
              onBack={() => { setBookId(null); setBookStatistics(null); }}
            />
          ) : sectionKey === 'overview' ? (
            <StatisticsOverview statistics={statistics} loading={loading} error={error} onBrowseBooks={() => selectSection('books')} />
          ) : (
            <RecordsTable
              section={section}
              sectionKey={sectionKey}
              records={records}
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              loading={loading}
              error={error}
              onPageChange={setPage}
              onBookSelect={openBookStatistics}
            />
          )}
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('react-app')).render(<AdminApp />);
