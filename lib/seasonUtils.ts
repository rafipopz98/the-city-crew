/**
 * Detects the current Premier League season based on today's date.
 *
 * Premier League seasons run approximately August to May.
 * Season naming: "YYYY/YY" where the first year is when the season starts.
 */

export function getCurrentSeasonYear(): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (0 = Jan, 7 = Aug)

  if (currentMonth >= 7) {
    // August to December → season that starts this year
    return `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;
  } else {
    // January to July → season that started last year
    return `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
  }
}

export function getNextSeasonYear(): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (currentMonth >= 7) {
    return `${currentYear + 1}/${(currentYear + 2).toString().slice(-2)}`;
  } else {
    return `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;
  }
}

export function isPreSeason(): boolean {
  const currentMonth = new Date().getMonth();
  return currentMonth === 5 || currentMonth === 6; // June or July
}
