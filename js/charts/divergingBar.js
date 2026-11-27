// divergingBar.js - Q6: percentage change between two years per group; bars go left (fall) or right (rise) from zero.
import { showTip, showTipAt, hideTip } from '../interactions.js';
export function divergingBar(sel, rows, o) {
  // rows: [{ name, a, b, pct }] sorted by pct; o.yearA, o.yearB, o.title
  const W = 800, H = 40 + rows.length * 30 + 44, m = { top: 20, right: 70, bottom: 44, left: 230 }, w = W - m.left - m.right, h = H - m.top - m.bottom;
  const svg = d3.select(sel).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'group').attr('aria-label', o.title);
  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`), fmt = d3.format(',');
  const ext = d3.extent(rows, d => d.pct), x = d3.scaleLinear([Math.min(0, ext[0]) * 1.15, Math.max(0, ext[1]) * 1.15], [0, w]).nice();
  const y = d3.scaleBand(rows.map(d => d.name), [0, h]).padding(0.25);
  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => (d > 0 ? '+' : '') + d + '%'));
  g.append('text').attr('x', w / 2).attr('y', h + 38).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', 'currentColor').text(`Change in hospitalisations, ${o.yearA} to ${o.yearB}`);
  const sign = p => (p > 0 ? '+' : '') + p.toFixed(0) + '%';
  const html = d => `<strong>${d.name}</strong><br>${fmt(d.a)} in ${o.yearA} → ${fmt(d.b)} in ${o.yearB}<br>${sign(d.pct)}`;
  g.selectAll('rect').data(rows).join('rect').attr('x', d => x(Math.min(0, d.pct))).attr('y', d => y(d.name)).attr('height', y.bandwidth())
    .attr('width', d => Math.abs(x(d.pct) - x(0))).attr('fill', d => (d.pct >= 0 ? '#D55E00' : '#0072B2')).attr('tabindex', 0).attr('role', 'img')
    .attr('aria-label', d => `${d.name}: ${sign(d.pct)}, from ${fmt(d.a)} to ${fmt(d.b)}`)
    .on('mousemove', (e, d) => showTip(e, html(d))).on('mouseleave', hideTip).on('focus', function (e, d) { showTipAt(this, html(d)); }).on('blur', hideTip);
  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', h).attr('stroke', '#1f2933');
  g.selectAll('text.name').data(rows).join('text').attr('class', 'name').attr('x', x(0) + (ext[0] < 0 ? -8 : -8)).attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end').attr('font-size', 12).attr('fill', 'currentColor').attr('transform', `translate(${x.range()[0] - x(0)},0)`).text(d => d.name);
  g.selectAll('text.pct').data(rows).join('text').attr('class', 'pct').attr('y', d => y(d.name) + y.bandwidth() / 2 + 4).attr('font-size', 12).attr('font-weight', 700)
    .attr('x', d => x(d.pct) + (d.pct >= 0 ? 5 : -5)).attr('text-anchor', d => (d.pct >= 0 ? 'start' : 'end')).attr('fill', 'currentColor').text(d => sign(d.pct));
}
