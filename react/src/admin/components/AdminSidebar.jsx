import React from 'react';

export default function AdminSidebar({ navigation, activeKey, detailOpen, onSelect }) {
  return (
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/" aria-label="返回首页">
        <span className="brand-mark">N</span>
        <span>Novel<span className="brand-caption">STUDIO / ADMIN</span></span>
      </a>
      <nav className="admin-nav" aria-label="管理导航">
        {navigation.map((item, index) => (
          <button className={`nav-item${activeKey === item.key && !detailOpen ? ' active' : ''}`} key={item.key} onClick={() => onSelect(item.key)} type="button">
            <span className="nav-index">{String(index + 1).padStart(2, '0')}</span>
            <span>{item.label}</span>
            {activeKey === item.key && !detailOpen && <span className="nav-current" aria-hidden="true" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="status-dot" /> 内容管理系统
        <span className="sidebar-version">ADMIN / 01</span>
      </div>
    </aside>
  );
}
