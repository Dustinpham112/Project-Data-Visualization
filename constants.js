// constants.js - shared settings: palette, sizes, column names, notes.
// AI use: [team: summarise the prompts used, or write "No AI was used"]
export const COLORS = { base:'#0072B2', highlight:'#E69F00', female:'#56B4E9', male:'#0072B2', suppressed:'#56B4E9' }; // Okabe-Ito
export const MARGIN = { top:30, right:20, bottom:40, left:70 };
// Column names as exported from KNIME - change them here only if your CSV headers differ.
export const COLS = { year:'Year', ro:'Road user', age:'Age group', sex:'Sex', hosp:'Hospitalisations',
                      rem:'Remoteness', bed:'Avg_bed_days', half:'Half', share:'FN_share_pct' };
export const AGE_ORDER = ['0-7','8-16','17-25','26-39','40-64','65-74','75+'];
export const REMOTE_ORDER = ['Major Cities','Regional','Remote'];
export const BREAKS = [
  { year:2012, text:'Victoria changed its hospital admission rules from 2012, so earlier years are not directly comparable.' },
  { year:2017, text:'New South Wales introduced changes from 2017, so earlier years are not directly comparable.' },
  { year:2020, text:'Hospitalisations dipped in 2020; the data do not show why.' } ];
