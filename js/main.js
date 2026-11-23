// main.js - start-up: loads data, prepares each question's data and draws the charts.
// AI use: [team: summarise the prompts used, or write "No AI was used"]
import { COLORS, COLS, AGE_ORDER, REMOTE_ORDER } from './constants.js';
import { loadAll } from './dataLoader.js';
import { selectRoadUser, onChange } from './interactions.js';
import { lineChart } from './charts/lineChart.js';
import { barChart } from './charts/barChart.js';
import { groupedBar } from './charts/groupedBar.js';

const D = await loadAll();

// Q1: yearly trend
lineChart('#chart-q1', D.year);

// Q2: total per road user, top 5 plus "Other"
const totals = d3.rollups(D.roadUser, v => d3.sum(v, d => d[COLS.hosp]), d => d[COLS.ro]).sort((a, b) => b[1] - a[1]);
const topNames = new Set(totals.slice(0, 5).map(d => d[0]));
const q2 = totals.slice(0, 5).map(([name, v]) => ({ name, v }));
if (totals.length > 5) q2.push({ name: `Other (${totals.length - 5} groups)`, v: d3.sum(totals.slice(5), d => d[1]) });
const q2chart = barChart('#chart-q2', q2, { label: 'name', value: 'v', horizontal: true, selectable: true, onSelect: selectRoadUser,
  title: 'Hospitalisations by road user, 2011-2021', valueTitle: 'Hospitalisations (cumulative)' });

// Q3: age and sex, filtered by the road user selected in Q2
const inGroup = (ro, sel) => !sel || (sel.startsWith('Other') ? !topNames.has(ro) : ro === sel);
function drawQ3(sel) {
  const rows = D.ageSex.filter(d => inGroup(d[COLS.ro], sel) && AGE_ORDER.includes(d[COLS.age]) && ['Female', 'Male'].includes(d[COLS.sex]));
  const agg = d3.rollups(rows, v => d3.sum(v, d => d[COLS.hosp]), d => d[COLS.age], d => d[COLS.sex])
    .flatMap(([age, a]) => a.map(([sex, v]) => ({ age, sex, v })));
  groupedBar('#chart-q3', agg);
  d3.select('#q3-sub').text(sel ? `Selected road user: ${sel}` : 'All road users');
}
onChange(sel => { q2chart.highlight(sel); drawQ3(sel); });
drawQ3(null);

// Q4: two small charts (separate scales, no dual axis)
const rem = REMOTE_ORDER.map(r => D.remote.find(d => d[COLS.rem] === r)).filter(Boolean);
barChart('#chart-q4a', rem, { label: COLS.rem, value: COLS.hosp, title: 'Hospitalisations by remoteness', valueTitle: 'Hospitalisations' });
barChart('#chart-q4b', rem, { label: COLS.rem, value: COLS.bed, title: 'Average bed days per hospitalisation by remoteness',
  valueTitle: 'Average bed days', format: d3.format('.2f'), axisFormat: d3.format('.0f') });

// Q5: First Nations share by half-year; Jul-Dec 2014 is drawn lighter (suppressed values)
const fn = D.fn.map(d => ({ ...d, label: `${d[COLS.year]} ${String(d[COLS.half]).slice(0, 3)}` }));
barChart('#chart-q5', fn, { label: 'label', value: COLS.share, title: 'First Nations share of hospitalisations by half-year',
  valueTitle: 'Share (%)', width: 800, height: 320, showValues: false, format: v => v.toFixed(1) + '%',
  tickFormat: d => (d.endsWith('Jan') ? d.slice(0, 4) : ''), color: d => (d.label === '2014 Jul' ? COLORS.suppressed : COLORS.base) });
