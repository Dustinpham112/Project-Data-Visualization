// dataLoader.js - loads the CSV files exported from KNIME and converts numeric columns.
// Expected files (headers in constants.js COLS):
//  hosp_year.csv: Year, Hospitalisations | hosp_year_roaduser.csv: Year, Road user, Hospitalisations
//  hosp_age_sex_roaduser.csv: Year, Age group, Sex, Road user, Hospitalisations
//  hosp_remoteness.csv: Remoteness, Hospitalisations, Avg_bed_days | fn_share.csv: Year, Half, FN_share_pct
import { COLS } from './constants.js';
const num = keys => d => { keys.forEach(k => { d[k] = +d[k]; }); return d; };
export async function loadAll() {
  try {
    const [year, roadUser, ageSex, remote, fn] = await Promise.all([
      d3.csv('data/hosp_year.csv', num([COLS.year, COLS.hosp])),
      d3.csv('data/hosp_year_roaduser.csv', num([COLS.year, COLS.hosp])),
      d3.csv('data/hosp_age_sex_roaduser.csv', num([COLS.year, COLS.hosp])),
      d3.csv('data/hosp_remoteness.csv', num([COLS.hosp, COLS.bed])),
      d3.csv('data/fn_share.csv', num([COLS.year, COLS.share]))
    ]);
    return { year, roadUser, ageSex, remote, fn };
  } catch (err) {
    document.getElementById('error').hidden = false;   // show a message instead of a blank page
    throw err;
  }
}
