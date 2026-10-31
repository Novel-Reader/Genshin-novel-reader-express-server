import React from 'react';
import AuthorChart from './AuthorChart';

export default function StatisticsOverview({ statistics, loading, error, onBrowseBooks }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONTENT OPERATIONS&nbsp; / &nbsp;OVERVIEW</div>
          <h1>统计概览</h1>
          <p>平台内容与读者互动的整体情况。</p>
        </div>
      </div>
      {error ? <div className="detail-error">{error}</div> : (
        <>
          <div className="stat-cards">
            <article className="stat-card">
              <span>注册用户</span>
              <strong>{loading ? '—' : Number(statistics?.users || 0).toLocaleString('zh-CN')}</strong>
              <small>平台用户总数</small>
            </article>
            <article className="stat-card">
              <span>书籍作品</span>
              <strong>{loading ? '—' : Number(statistics?.books || 0).toLocaleString('zh-CN')}</strong>
              <small>已收录作品</small>
            </article>
            <article className="stat-card">
              <span>读者评论</span>
              <strong>{loading ? '—' : Number(statistics?.comments || 0).toLocaleString('zh-CN')}</strong>
              <small>累计互动数量</small>
            </article>
          </div>
          {loading ?
            <section className="detail-panel">
              <p className="stats-empty">正在读取统计…</p>
            </section>
          :
            <AuthorChart authors={statistics?.commentAuthors} books={statistics?.commentBooks} />
          }
          <button className="overview-books-link" onClick={onBrowseBooks} type="button">浏览书籍并查看单本统计 <span>→</span></button>
        </>
      )}
    </>
  );
}
