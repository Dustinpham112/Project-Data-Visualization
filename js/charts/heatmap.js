// heatmap.js - Q7: share of each road user's hospitalisations falling in each age group (each row sums to 100%).
import { showTip, showTipAt, hideTip } from '../interactions.js';
export function heatmap(sel, cells, rowNames, colNames, o) {
  // cells: [{ row, col, pct, v }]
  const W = 800, H = 40 + rowNames.length * 46 + 56, m = { top: 34, right: 20, bottom: 40, left: 200 }, w = W - m.left - m.right, h = H - m.top - m.bottom;
  const svg = d3.select(sel).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'group').attr('aria-label', o.title);
  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`), fmt = d3.format(',');
  const x = d3.scaleBand(colNames, [0, w]).padding(0.05), y = d3.scaleBand(rowNames, [0, h]).padding(0.05);
  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(cells, d => d.pct) * 1.15]);
  g.append('g').call(d3.axisTop(x).tickSize(0)).select('.domain').remove();
  g.append('g').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
  g.append('text').attr('x', w / 2).attr('y', h + 30).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', 'currentColor').text('Age group (years). Each row adds to 100%.');
  const html = d => `<strong>${d.row}, age ${d.col}</strong><br>${d.pct.toFixed(1)}% of its hospitalisations<br>${fmt(d.v)} cases`;
  const c = g.selectAll('g.cell').data(cells).join('g').attr('class', 'cell').attr('transform', d => `translate(${x(d.col)},${y(d.row)})`)
    .attr('tabindex', 0).attr('role', 'img').attr('aria-label', d => `${d.row}, age ${d.col}: ${d.pct.toFixed(1)}%`)
    .on('mousemove', (e, d) => showTip(e, html(d))).on('mouseleave', hideTip).on('focus', function (e, d) { showTipAt(this, html(d)); }).on('blur', hideTip);
  c.append('rect').attr('width', x.bandwidth()).attr('height', y.bandwidth()).attr('rx', 4).attr('fill', d => color(d.pct));
  c.append('text').attr('x', x.bandwidth() / 2).attr('y', y.bandwidth() / 2 + 5).attr('text-anchor', 'middle').attr('font-size', 13)
    .attr('fill', d => (d.pct > color.domain()[1] * 0.55 ? '#fff' : '#1f2933')).text(d => d.pct.toFixed(0) + '%');
}
