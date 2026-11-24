// interactions.js - tooltip and the shared "selected road user" state used to link Q2 and Q3.
const tip = d3.select('#tooltip');
export function showTip(event, html) {
  tip.html(html).style('opacity', 1).style('left', (event.pageX + 12) + 'px').style('top', (event.pageY + 12) + 'px');
}
export function showTipAt(el, html) {            // keyboard focus: place the tooltip beside the element
  const r = el.getBoundingClientRect();
  tip.html(html).style('opacity', 1).style('left', (r.right + window.scrollX + 6) + 'px').style('top', (r.top + window.scrollY) + 'px');
}
export function hideTip() { tip.style('opacity', 0); }

let selected = null; const listeners = [];
export function selectRoadUser(name) {           // clicking the selected bar again clears the selection
  selected = (selected === name) ? null : name;
  listeners.forEach(f => f(selected));
}
export function onChange(f) { listeners.push(f); }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && selected) selectRoadUser(selected); });
