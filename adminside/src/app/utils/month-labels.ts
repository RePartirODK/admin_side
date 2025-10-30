export const MONTH_LABELS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export function toSeriesArray(monthly: {month: number; count: number}[]): number[] {
  const byMonth = new Map(monthly.map(m => [m.month, m.count]));
  return Array.from({ length: 12 }, (_, i) => byMonth.get(i + 1) ?? 0);
}

