/**
 * Packaging Finder price labelling. Prices in the CSV are estimates, never a quotation.
 * VERIFY-LATER[FINDER-01]: confirm the real review date of public/ToolData/advanced_packaging_recommendations_v2.csv
 * (last committed March 2026) and review it every quarter. Update this constant when the CSV is refreshed.
 */
export const PRICE_DATA_UPDATED = 'March 2026';

export const PRICE_NOTE = `Prices indicative, updated ${PRICE_DATA_UPDATED}. Final quote after we confirm size, board and quantity.`;

export const formatInr = (value: number): string =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
