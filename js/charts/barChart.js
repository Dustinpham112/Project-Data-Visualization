// barChart.js - one bar chart used for Q2 (horizontal, selectable), Q4 and Q5 (vertical). Bars start at zero.
import { COLORS } from '../constants.js';
import { showTip, showTipAt, hideTip } from '../interactions.js';
export function barChart(sel, data, o) {
  // o: { label, value, title, valueTitle, horizontal, selectable, onSelect, format, axisFormat, tickFormat, color, showValues, width, height }
  const horiz = !!o.horizontal, W = o.width || (horiz ? 640 : 420), H = o.height || 300;
  const m = { top: 20, right: 55, bottom: horiz ? 42 : 50, left: horiz ? 170 : 60 };
  const w = W - m.left - m.right, h = H - m.top - m.bottom;
  const L = d => d[o.label], V = d => d[o.value], fmt = o.format || d3.format(',');
  const fill = d => (o.color ? o.color(d) : COLORS.base);
  const svg = d3.select(sel).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'group').attr('aria-label', o.title);
  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
  const cat = d3.scaleBand(data.map(L), horiz ? [0, h] : [0, w]).padding(0.25);
  const val = d3.scaleLinear([0, d3.max(data, V) * 1.1], horiz ? [0, w] : [h, 0]).nice();
  const vf = o.axisFormat || d3.format('~s');
  g.append('g').attr('transform', horiz ? null : `translate(0,${h})`)
    .call(horiz ? d3.axisLeft(cat) : d3.axisBottom(cat).tickFormat(o.tickFormat || (d => d)));
  g.append('g').attr('transform', horiz ? `translate(0,${h})` : null)
    .call((horiz ? d3.axisBottom(val) : d3.axisLeft(val)).ticks(5).tickFormat(vf));
  const t = g.append('text').attr('fill', 'currentColor').attr('text-anchor', 'middle').attr('font-size', 12).text(o.valueTitle || '');
  if (horiz) t.attr('x', w / 2).attr('y', h + 36); else t.attr('transform', 'rotate(-90)').attr('x', -h / 2).attr('y', -44);
  const html = d => `<strong>${L(d)}</strong><br>${fmt(V(d))}<br>Source: BITRE/AIHW`;
  const bars = g.selectAll('rect.bar').data(data).join('rect').attr('class', 'bar')
    .attr('x', d => horiz ? 0 : cat(L(d))).attr('y', d => horiz ? cat(L(d)) : val(V(d)))
    .attr('width', d => horiz ? val(V(d)) : cat.bandwidth()).attr('height', d => horiz ? cat.bandwidth() : h - val(V(d)))
    .attr('fill', fill).attr('tabindex', 0).attr('role', o.selectable ? 'button' : 'img')
    .attr('aria-label', d => `${L(d)}: ${fmt(V(d))}`)
    .on('mousemove', (e, d) => showTip(e, html(d))).on('mouseleave', hideTip)
    .on('focus', function (e, d) { showTipAt(this, html(d)); }).on('blur', hideTip)
    .on('click', (e, d) => { if (o.selectable) o.onSelect(L(d)); })
    .on('keydown', (e, d) => { if (o.selectable && e.key === 'Enter') { e.preventDefault(); o.onSelect(L(d)); } });
  if (o.selectable) bars.attr('aria-pressed', 'false');
  if (o.showValues !== false) {                    // direct value labels
    g.selectAll('text.val').data(data).join('text').attr('class', 'val').attr('fill', 'currentColor').attr('font-size', 11)
      .attr('x', d => horiz ? val(V(d)) + 4 : cat(L(d)) + cat.bandwidth() / 2)
      .attr('y', d => horiz ? cat(L(d)) + cat.bandwidth() / 2 + 4 : val(V(d)) - 4)
      .attr('text-anchor', horiz ? 'start' : 'middle').text(d => fmt(V(d)));
  }
  return { highlight(name) {                       // used to show the selected road user
    bars.attr('fill', d => (name && L(d) === name) ? COLORS.highlight : fill(d));
    if (o.selectable) bars.attr('aria-pressed', d => String(L(d) === name));
  } };
}
