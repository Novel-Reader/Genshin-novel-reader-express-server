import React, { useEffect, useRef, useState } from 'react';
import { Chart } from '@antv/g2';

export default function AuthorChart({ authors = [], books = [], title = '活跃评论作者', description = '评论数最多的 12 位作者' }) {
  const container = useRef(null);
  const chart = useRef(null);
  const [dimension, setDimension] = useState('author');
  const [chartType, setChartType] = useState('interval');

  useEffect(() => {
    const source = dimension === 'author' ? authors : books;
    if (!container.current || !source.length) return undefined;
    chart.current?.destroy();
    const chartData = source.map((item) => ({
      name: dimension === 'author' ? (item.author || '匿名') : (item.name || `书籍 ${item.book}`),
      count: Number(item.count),
    }));
    const instance = new Chart({
      container: container.current,
      autoFit: true,
      height: 290,
      padding: [20, 20, 58, 42],
    });
    instance.data(chartData);
    instance.scale('count', { min: 0, nice: true });
    instance.axis('name', { label: { autoRotate: true, autoHide: false, style: { fill: '#738075', fontSize: 10 } } });
    instance.axis('count', { label: { style: { fill: '#8c978c', fontSize: 10 } }, grid: { line: { style: { stroke: '#edf0eb', lineDash: [3, 3] } } } });
    instance.tooltip({ showMarkers: false });
    if (chartType === 'interval') instance.interval().position('name*count').color('#82977c');
    else {
      instance.line().position('name*count').color('#657d68').shape('smooth');
      instance.point().position('name*count').color('#657d68').shape('circle').style({ stroke: '#fff', lineWidth: 2 });
    }
    instance.render();
    chart.current = instance;

    return () => {
      instance.destroy();
      if (chart.current === instance) chart.current = null;
    };
  }, [authors, books, chartType, dimension]);

  return (
    <section className="detail-panel chart-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">COMMUNITY / ANALYTICS</span><h2>{title}</h2></div>
        <span>{description}</span>
      </div>
      <div className="chart-controls">
        {books.length > 0 && <label>统计维度
          <select value={dimension} onChange={(event) => setDimension(event.target.value)}>
            <option value="author">评论作者</option>
            <option value="book">书籍</option>
          </select>
        </label>}
        <label>图表类型
          <select value={chartType} onChange={(event) => setChartType(event.target.value)}>
            <option value="interval">柱状图</option>
            <option value="line">折线图</option>
          </select>
        </label>
      </div>
      {(dimension === 'author' ? authors : books).length ? <div className="chart-canvas" ref={container} /> : <p className="stats-empty">暂无评论统计</p>}
    </section>
  );
}
