// indexLine.js - Q6: yearly counts per road user rebased so the first year = 100 (compares growth, not size).
import { COLS } from '../constants.js';
import { showTip, showTipAt, hideTip } from '../interactions.js';
export function indexLine(sel, series, o) {
  // series: [{ name, color, values: [{year, v}] }]; o.focus = name drawn thicker
  const W = 800, H = 380, m = { top: 24, right: 150, bottom: 44, left: 60 }, w = W - m.left - m.right, h = H - m.top - m.bottom;
  const svg = d3.select(sel).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'group').attr('aria-label', o.title);
  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
  const years = series[0].values.map(d => d.year);
  const idx = s => s.values.map(d => ({ ...d, i: d.v / s.values[0].v * 100 }));
  const all = series.flatMap(idx), lo = Math.min(60, d3.min(all, d => d.i)), hi = d3.max(all, d => d.i);
  const x = d3.scaleLinear(d3.extent(years), [0, w]), y = d3.scaleLinear([lo, hi * 1.05], [h, 0]).nice();
  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(years.length).tickFormat(d3.format('d')));
  g.append('g').call(d3.axisLeft(y));
  g.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(100)).attr('y2', y(100)).attr('stroke', '#52606d').attr('stroke-dasharray', '4 4');
  g.append('text').attr('transform', 'rotate(-90)').attr('x', -h / 2).attr('y', -44).attr('text-anchor', 'middle').attr('font-size', 12)
    .attr('fill', 'currentColor').text(`Index (${years[0]} = 100)`);
  const line = d3.line().x(d => x(d.year)).y(d => y(d.i)), fmt = d3.format(',');
  series.forEach(s => {
    const pts = idx(s), last = pts[pts.length - 1], thick = s.name === o.focus;
    const html = `<strong>${s.name}</strong><br>${fmt(s.values[0].v)} in ${years[0]} → ${fmt(last.v)} in ${last.year}<br>Index ${last.i.toFixed(0)} (${last.i >= 100 ? '+' : ''}${(last.i - 100).toFixed(0)}%)`;
    const gs = g.append('g').attr('tabindex', 0).attr('role', 'img').attr('aria-label', `${s.name}: index ${last.i.toFixed(0)} in ${last.year}, ${years[0]} = 100`)
      .on('focus', function () { showTipAt(this, html); }).on('blur', hideTip);
    gs.append('path').datum(pts).attr('d', line).attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', thick ? 4 : 2.2);
    gs.selectAll('circle').data(pts).join('circle').attr('cx', d => x(d.year)).attr('cy', d => y(d.i)).attr('r', thick ? 4 : 3).attr('fill', s.color)
      .on('mousemove', (e, d) => showTip(e, `<strong>${s.name}, ${d.year}</strong><br>${fmt(d.v)} cases<br>Index ${d.i.toFixed(0)}`)).on('mouseleave', hideTip);
    gs.append('text').attr('x', w + 8).attr('y', y(last.i) + 4).attr('font-size', 12).attr('font-weight', thick ? 700 : 400).attr('fill', 'currentColor')
      .text(`${s.name} (${last.i >= 100 ? '+' : ''}${(last.i - 100).toFixed(0)}%)`);
  });
}
