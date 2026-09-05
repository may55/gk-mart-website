import { endOfDay, startOfDay, startOfMonth, startOfWeekMonday } from '../../src/utils/dates';

describe('date utilities', () => {
  const date = new Date(2026, 8, 4, 15, 30, 20, 500);

  it('returns day boundaries without mutating the input', () => {
    expect(startOfDay(date)).toEqual(new Date(2026, 8, 4, 0, 0, 0, 0));
    expect(endOfDay(date)).toEqual(new Date(2026, 8, 4, 23, 59, 59, 999));
    expect(date.getHours()).toBe(15);
  });

  it('finds Monday and month starts', () => {
    expect(startOfWeekMonday(date)).toEqual(new Date(2026, 7, 31, 0, 0, 0, 0));
    expect(startOfMonth(date)).toEqual(new Date(2026, 8, 1));
  });
});
