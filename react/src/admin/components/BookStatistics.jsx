import React from 'react';
import AuthorChart from './AuthorChart';
import Pagination from './Pagination';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-CN');
}

export default function BookStatistics({ book, statistics, page, pageSize, loading, error, onPageChange, onBack }) {
  if (!book) return (
    <section className="detail-panel">
      <p className="stats-empty">正在读取书籍…</p>
    </section>
  );
  const comments = statistics?.comments || { data: [], total: 0 };

  return (
    <>
      <div className="page-heading detail-heading">
        <div>
          <button className="back-link" onClick={onBack} type="button">← 返回书籍列表</button>
          <div className="eyebrow">BOOK STATISTICS&nbsp; / &nbsp;#{book.id}</div>
          <h1>{book.name}</h1>
          <p>{book.author || '佚名'} · {Number(book.size || 0).toLocaleString('zh-CN')} 字</p>
        </div>
      </div>
      {error ? <div className="detail-error">{error}</div> : (
        <>
          <div className="stat-cards">
            <article className="stat-card">
              <span>阅读次数</span>
              <strong>{Number(book.download_count || 0).toLocaleString('zh-CN')}</strong>
              <small>累计阅读记录</small>
            </article>
            <article className="stat-card">
              <span>评论总数</span>
              <strong>{Number(comments.total || 0).toLocaleString('zh-CN')}</strong>
              <small>读者互动</small>
            </article>
            <article className="stat-card">
              <span>评论作者</span>
              <strong>{statistics?.commentAuthors?.length || 0}</strong>
              <small>参与讨论的读者</small>
            </article>
          </div>
          {loading ? <section className="detail-panel"><p className="stats-empty">正在读取统计…</p></section> : <AuthorChart authors={statistics?.commentAuthors} title="评论作者分布" description="按评论数量排列" />}
          <section className="detail-panel comments-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">DISCUSSION / RECENT</span>
                <h2>读者评论</h2>
              </div>
              <span>共 {comments.total} 条</span>
            </div>
            <div className="detail-comments">
              {loading ? <p className="stats-empty">正在读取评论…</p> : comments.data.length ? comments.data.map((comment) => (
                <article className="detail-comment" key={comment.id}><div><strong>{comment.author || '匿名'}</strong><time>{formatDate(comment.created_at)}</time></div><p>{comment.detail}</p></article>
              )) : <p className="stats-empty">暂无评论</p>}
            </div>
            <Pagination page={page} total={comments.total} pageSize={pageSize} loading={loading} onPageChange={onPageChange} label="评论" />
          </section>
        </>
      )}
    </>
  );
}
