// main.js - start-up: loads data, prepares each question's data and draws the charts.
// AI use: Our team use AI for to take idea and some coding from AI which to fix our code
import { COLORS, COLS, AGE_ORDER, REMOTE_ORDER } from './constants.js';
import { loadAll } from './dataLoader.js';
import { selectRoadUser, onChange } from './interactions.js';
import { lineChart } from './charts/lineChart.js';
import { barChart } from './charts/barChart.js';
import { groupedBar } from './charts/groupedBar.js';
import { indexLine } from './charts/indexLine.js';
import { divergingBar } from './charts/divergingBar.js';
import { heatmap } from './charts/heatmap.js';

const D = await loadAll();

// Q1: yearly trend
D.year.sort((a, b) => a[COLS.year] - b[COLS.year]);
lineChart('#chart-q1', D.year);

// Q2: total per road user, top 5 plus "Other"
const totals = d3.rollups(D.roadUser, v => d3.sum(v, d => d[COLS.hosp]), d => d[COLS.ro]).sort((a, b) => b[1] - a[1]);
const topNames = new Set(totals.slice(0, 5).map(d => d[0]));
const q2 = totals.slice(0, 5).map(([name, v]) => ({ name, v }));
if (totals.length > 5) q2.push({ name: `Other (${totals.length - 5} groups)`, v: d3.sum(totals.slice(5), d => d[1]) });
const q2chart = barChart('#chart-q2', q2, { label: 'name', value: 'v', horizontal: true, selectable: true, onSelect: selectRoadUser,
  title: 'Hospitalisations by road user, 2011-2021', valueTitle: 'Hospitalisations (cumulative)' });

// Q3: age and sex, filtered by the road user selected in Q2
const otherName = q2.length > 5 ? q2[5].name : null;   // exact name of the combined group
const inGroup = (ro, sel) => !sel || (sel === otherName ? !topNames.has(ro) : ro === sel);
function drawQ3(sel) {
  const rows = D.ageSex.filter(d => inGroup(d[COLS.ro], sel) && AGE_ORDER.includes(d[COLS.age]) && ['Female', 'Male'].includes(d[COLS.sex]));
  const agg = d3.rollups(rows, v => d3.sum(v, d => d[COLS.hosp]), d => d[COLS.age], d => d[COLS.sex])
    .flatMap(([age, a]) => a.map(([sex, v]) => ({ age, sex, v })));
  groupedBar('#chart-q3', agg);
  d3.select('#q3-sub').text(sel ? `Selected road user: ${sel}` : 'All road users');
}
const q2status = d3.select('#q2-status'), q2clear = d3.select('#q2-clear'), srStatus = d3.select('#sr-status');
q2clear.on('click', () => selectRoadUser(null));
onChange(sel => {
  q2chart.highlight(sel); drawQ3(sel);
  q2status.text(sel ? `Showing: ${sel}.` : 'Showing all road users.'); q2clear.property('hidden', !sel);
  srStatus.text(sel ? `Age and sex chart updated for ${sel}.` : 'Age and sex chart reset to all road users.');
});
drawQ3(null);

// Q4: two small charts (separate scales, no dual axis)
const rem = REMOTE_ORDER.map(r => D.remote.find(d => d[COLS.rem] === r)).filter(Boolean);
barChart('#chart-q4a', rem, { label: COLS.rem, value: COLS.hosp, title: 'Hospitalisations by remoteness', valueTitle: 'Hospitalisations' });
barChart('#chart-q4b', rem, { label: COLS.rem, value: COLS.bed, title: 'Average bed days per hospitalisation by remoteness',
  valueTitle: 'Average bed days', color: () => COLORS.q4b, format: d3.format('.2f'), axisFormat: d3.format('.0f') });

// Q5: First Nations share by half-year; Jul-Dec 2014 is drawn lighter (suppressed values)
D.fn.sort((a, b) => a[COLS.year] - b[COLS.year] || (a[COLS.half] < b[COLS.half] ? -1 : 1));   // CSV lists all Jan-Jun first
const fn = D.fn.map(d => ({ ...d, label: `${d[COLS.year]} ${String(d[COLS.half]).slice(0, 3)}` }));
barChart('#chart-q5', fn, { label: 'label', value: COLS.share, title: 'First Nations share of hospitalisations by half-year',
  valueTitle: 'Share (%)', width: 800, height: 320, showValues: false, format: v => v.toFixed(1) + '%',
  tickFormat: d => (d.endsWith('Jan') ? d.slice(0, 4) : ''), color: d => (d.label === '2014 Jul' ? COLORS.suppressed : COLORS.q5) });

// Hero KPI cards, computed from the loaded data
const latest = D.year[D.year.length - 1], peak = d3.greatest(D.year, d => d[COLS.hosp]), n = d3.format(',');
const kpis = [[n(latest[COLS.hosp]), `hospitalised in ${latest[COLS.year]}`], [n(peak[COLS.hosp]), `peak year (${peak[COLS.year]})`],
  [totals[0][0], `largest road-user group (${n(totals[0][1])} cases)`]];
d3.select('#kpis').selectAll('div').data(kpis).join(enter => {
  const e = enter.append('div').attr('class', 'kpi');
  e.append('strong').text(d => d[0]); e.append('span').text(d => d[1]); return e; });

// Q6: compare road users - growth since the first year (index) and % change
const y0 = d3.min(D.roadUser, d => d[COLS.year]), y1 = d3.max(D.roadUser, d => d[COLS.year]);
const byRo = d3.group(D.roadUser, d => d[COLS.ro]);
const countOf = (ro, yr) => d3.sum(byRo.get(ro) || [], d => d[COLS.year] === yr ? d[COLS.hosp] : 0);
const ROAD_COLORS = ['#0072B2', '#D55E00', '#009E73', '#56B4E9', '#CC79A7'];
const top5 = totals.slice(0, 5).map(d => d[0]);
const focusRo = d3.greatest(top5, ro => countOf(ro, y1) / countOf(ro, y0));      // fastest-growing of the top 5
indexLine('#chart-q6a', top5.map((ro, i) => ({ name: ro, color: ROAD_COLORS[i],
  values: d3.range(y0, y1 + 1).map(year => ({ year, v: countOf(ro, year) })) })), { focus: focusRo, title: `Index of hospitalisations by road user, ${y0} = 100` });
const change = [...byRo.keys()].filter(ro => ro !== 'Other or unknown' && countOf(ro, y0) >= 200)
  .map(ro => ({ name: ro, a: countOf(ro, y0), b: countOf(ro, y1), pct: (countOf(ro, y1) / countOf(ro, y0) - 1) * 100 })).sort((a, b) => b.pct - a.pct);
divergingBar('#chart-q6b', change, { yearA: y0, yearB: y1, title: `Percentage change in hospitalisations by road user, ${y0} to ${y1}` });

// Q7: age profile per road user (row percentages)
const ageRows = D.ageSex.filter(d => AGE_ORDER.includes(d[COLS.age]));
const groupOf = ro => topNames.has(ro) ? ro : otherName;
const q7rows = q2.map(d => d.name);
const q7cells = q7rows.flatMap(row => {
  const rs = ageRows.filter(d => groupOf(d[COLS.ro]) === row), tot = d3.sum(rs, d => d[COLS.hosp]);
  return AGE_ORDER.map(col => { const v = d3.sum(rs, d => d[COLS.age] === col ? d[COLS.hosp] : 0); return { row, col, v, pct: v / tot * 100 }; });
});
heatmap('#chart-q7', q7cells, q7rows, AGE_ORDER, { title: 'Share of each road user\'s hospitalisations by age group' });

// Direction section: figures filled from the data so the text cannot drift from the charts
const pc = (a, b) => { const p = (b / a - 1) * 100; return (p >= 0 ? '+' : '') + p.toFixed(0) + '%'; };
const cyc = change.find(d => d.name === 'Pedal cyclist'), ped = change.find(d => d.name === 'Pedestrian');
if (cyc) d3.select('#d-cyc').text(`${n(cyc.a)} to ${n(cyc.b)} (${pc(cyc.a, cyc.b)})`);
if (ped) d3.select('#d-ped').text(`${n(ped.a)} to ${n(ped.b)} (${pc(ped.a, ped.b)})`);
const moto = ageRows.filter(d => d[COLS.ro] === 'Motorcyclist');
const maleAdult = rs => d3.sum(rs, d => d[COLS.sex] === 'Male' && ['17-25', '26-39', '40-64'].includes(d[COLS.age]) ? d[COLS.hosp] : 0) / d3.sum(rs, d => d[COLS.hosp]);
d3.select('#d-moto').text(`${(maleAdult(moto) * 100).toFixed(0)}%`);
d3.select('#d-moto-all').text(`${(maleAdult(ageRows) * 100).toFixed(0)}%`);
const bedOf = r => (D.remote.find(d => d[COLS.rem] === r) || {})[COLS.bed], f1 = d3.format('.1f');
d3.select('#d-bed').text(`${f1(bedOf('Regional'))} days`);
d3.select('#d-bed-cmp').text(`Major Cities ${f1(bedOf('Major Cities'))} days; Remote ${f1(bedOf('Remote'))} days`);
const fnText = d => `${d[COLS.share].toFixed(1)}% (${d[COLS.half]} ${d[COLS.year]})`;
d3.select('#d-fn').text(`${fnText(fn[0])} to ${fnText(fn[fn.length - 1])}`);
d3.select('#d-fn-peak').text(fnText(d3.greatest(fn, d => d[COLS.share])));

// Direction charts: each priority's figure beside its comparison; the highlighted bar is the priority itself
const HI = COLORS.highlight, BASE = COLORS.base, hl = name => d => (d.label === name ? HI : BASE);
if (cyc && ped) barChart('#chart-d1', [{ label: 'Pedestrian', v: ped.b / ped.a * 100 }, { label: 'Pedal cyclist', v: cyc.b / cyc.a * 100 }],
  { label: 'label', value: 'v', title: 'Index of hospitalisations in the last year, first year = 100', valueTitle: `Index, ${y1} (${y0} = 100)`,
    format: d3.format('.0f'), axisFormat: d3.format('.0f'), color: hl('Pedal cyclist') });
barChart('#chart-d2', [{ label: 'All road users', v: maleAdult(ageRows) * 100 }, { label: 'Motorcyclist', v: maleAdult(moto) * 100 }],
  { label: 'label', value: 'v', title: 'Share of cases that are men aged 17 to 64', valueTitle: 'Share of cases (%)',
    format: v => v.toFixed(0) + '%', axisFormat: d => d + '%', color: hl('Motorcyclist') });
barChart('#chart-d3', ['Major Cities', 'Remote', 'Regional'].map(r => ({ label: r, v: bedOf(r) })),
  { label: 'label', value: 'v', title: 'Average bed days by remoteness', valueTitle: 'Average bed days',
    format: d3.format('.1f'), axisFormat: d3.format('.0f'), color: hl('Regional') });
const fnPeak = d3.greatest(fn, d => d[COLS.share]), fnPts = [[fn[0], 'First half-year'], [fnPeak, 'Peak'], [fn[fn.length - 1], 'Latest half-year']]
  .map(([d, k]) => ({ label: `${k}: ${d[COLS.half]} ${d[COLS.year]}`, v: d[COLS.share] }));
barChart('#chart-d4', fnPts, { label: 'label', value: 'v', title: 'First Nations share at the start, peak and end', valueTitle: 'Share (%)',
  format: v => v.toFixed(1) + '%', axisFormat: d => d + '%', tickFormat: d => d.split(':')[0], color: d => (d.label.startsWith('Peak') ? HI : BASE) });
