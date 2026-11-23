// lineChart.js - Q1: yearly line chart, y-axis from zero, with series-break markers.
import { COLORS, MARGIN, COLS, BREAKS } from '../constants.js';
import { showTip, showTipAt, hideTip } from '../interactions.js';
export function lineChart(sel, data) {
  const W = 800, H = 360, w = W - MARGIN.left - MARGIN.right, h = H - MARGIN.top - MARGIN.bottom;
  const svg = d3.select(sel).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'group')
    .attr('aria-label', `Line chart of yearly hospitalisations, ${data[0][COLS.year]} to ${data[data.length - 1][COLS.year]}`);
  const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  const x = d3.scaleLinear(d3.extent(data, d => d[COLS.year]), [0, w]);
  const y = d3.scaleLinear([0, d3.max(data, d => d[COLS.hosp]) * 1.1], [h, 0]).nice();
  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.format('d')));
  g.append('g').call(d3.axisLeft(y).tickFormat(d3.format(',')));
  g.append('text').attr('fill', 'currentColor').attr('text-anchor', 'middle').attr('font-size', 12)
    .attr('transform', 'rotate(-90)').attr('x', -h / 2).attr('y', -55).text('Hospitalisations per year');
  BREAKS.forEach(b => {                           // dashed marker plus a focusable hit area for the tooltip
    const bx = x(b.year), html = `<strong>${b.year}</strong><br>${b.text}`;
    g.append('line').attr('x1', bx).attr('x2', bx).attr('y1', 0).attr('y2', h)
      .attr('stroke', COLORS.highlight).attr('stroke-dasharray', '4 4').attr('stroke-width', 2);
    g.append('rect').attr('x', bx - 12).attr('width', 24).attr('height', h).attr('fill', 'transparent')
      .attr('tabindex', 0).attr('aria-label', `${b.year}: ${b.text}`)
      .on('mousemove', e => showTip(e, html)).on('mouseleave', hideTip)
      .on('focus', function () { showTipAt(this, html); }).on('blur', hideTip);
  });
  g.append('path').datum(data).attr('fill', 'none').attr('stroke', COLORS.base).attr('stroke-width', 2.5)
    .attr('d', d3.line().x(d => x(d[COLS.year])).y(d => y(d[COLS.hosp])));
  const tipHtml = d => `<strong>${d[COLS.year]}</strong><br>${d3.format(',')(d[COLS.hosp])} hospitalisations<br>Source: BITRE/AIHW`;
  g.selectAll('circle').data(data).join('circle').attr('cx', d => x(d[COLS.year])).attr('cy', d => y(d[COLS.hosp]))
    .attr('r', 5).attr('fill', COLORS.base).attr('tabindex', 0).attr('role', 'img')
    .attr('aria-label', d => `${d[COLS.year]}: ${d3.format(',')(d[COLS.hosp])} hospitalisations`)
    .on('mousemove', (e, d) => showTip(e, tipHtml(d))).on('mouseleave', hideTip)
    .on('focus', function (e, d) { showTipAt(this, tipHtml(d)); }).on('blur', hideTip);
}
