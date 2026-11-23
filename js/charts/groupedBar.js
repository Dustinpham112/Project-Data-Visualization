// groupedBar.js - Q3: hospitalisations by age group, with female and male bars side by side. Redrawn on each update.
import { COLORS, AGE_ORDER } from '../constants.js';
import { showTip, showTipAt, hideTip } from '../interactions.js';
export function groupedBar(sel, rows) {              // rows: [{ age, sex, v }]
  const W = 760, H = 340, m = { top: 30, right: 20, bottom: 50, left: 70 }, w = W - m.left - m.right, h = H - m.top - m.bottom;
  const root = d3.select(sel); root.selectAll('*').remove();
  const svg = root.append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'group')
    .attr('aria-label', 'Grouped bar chart of hospitalisations by age group and sex');
  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
  const sexes = ['Female', 'Male'], col = { Female: COLORS.female, Male: COLORS.male };
  const x0 = d3.scaleBand(AGE_ORDER, [0, w]).padding(0.2), x1 = d3.scaleBand(sexes, [0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear([0, (d3.max(rows, d => d.v) || 1) * 1.1], [h, 0]).nice();
  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x0));
  g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('~s')));
  g.append('text').attr('fill', 'currentColor').attr('text-anchor', 'middle').attr('font-size', 12).attr('x', w / 2).attr('y', h + 40).text('Age group');
  g.append('text').attr('fill', 'currentColor').attr('text-anchor', 'middle').attr('font-size', 12)
    .attr('transform', 'rotate(-90)').attr('x', -h / 2).attr('y', -52).text('Hospitalisations');
  const html = d => `<strong>${d.age}, ${d.sex}</strong><br>${d3.format(',')(d.v)}<br>Source: BITRE/AIHW`;
  g.selectAll('rect').data(rows).join('rect').attr('x', d => x0(d.age) + x1(d.sex)).attr('y', d => y(d.v))
    .attr('width', x1.bandwidth()).attr('height', d => h - y(d.v)).attr('fill', d => col[d.sex])
    .attr('tabindex', 0).attr('role', 'img').attr('aria-label', d => `${d.age}, ${d.sex}: ${d3.format(',')(d.v)}`)
    .on('mousemove', (e, d) => showTip(e, html(d))).on('mouseleave', hideTip)
    .on('focus', function (e, d) { showTipAt(this, html(d)); }).on('blur', hideTip);
  sexes.forEach((s, i) => {                          // legend: colour plus text label
    svg.append('rect').attr('x', W - 160 + i * 80).attr('y', 6).attr('width', 12).attr('height', 12).attr('fill', col[s]);
    svg.append('text').attr('x', W - 144 + i * 80).attr('y', 16).attr('fill', 'currentColor').attr('font-size', 12).text(s);
  });
}
