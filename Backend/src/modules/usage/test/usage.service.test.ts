import { describe, expect, it } from "vitest";
import {
  buildActivity,
  buildActivityStats,
  buildDaily,
  computeDelta,
  resolveRange,
} from "../usage.service";
import type { ActivityDay, DailyModelUsage } from "../usage.types";

const IST_OFFSET = -330;

function row(overrides: Partial<DailyModelUsage> = {}): DailyModelUsage {
  return {
    day: "2026-08-10",
    provider: "groq",
    model: "llama-3.1-8b-instant",
    requests: 1,
    promptTokens: 10,
    outputTokens: 20,
    totalTokens: 30,
    ...overrides,
  };
}

describe("resolveRange", () => {
  it("ends at the start of the next local day", () => {
    const now = new Date("2026-08-13T04:00:00.000Z");
    const range = resolveRange("7d", IST_OFFSET, now);

    expect(range.to.toISOString()).toBe("2026-08-13T18:30:00.000Z");
  });

  it("spans exactly the requested number of days", () => {
    const range = resolveRange("7d", IST_OFFSET, new Date("2026-08-13T04:00:00.000Z"));
    const spanDays = (range.to.getTime() - range.from.getTime()) / 86_400_000;

    expect(spanDays).toBe(7);
  });

  it("puts the previous window immediately before the current one", () => {
    const range = resolveRange("30d", IST_OFFSET, new Date("2026-08-13T04:00:00.000Z"));
    const previousSpan = (range.from.getTime() - range.previousFrom.getTime()) / 86_400_000;

    expect(previousSpan).toBe(30);
  });

  it("keeps a late-evening local request inside the current day", () => {
    const lateLocal = new Date("2026-08-13T19:00:00.000Z");
    const range = resolveRange("7d", IST_OFFSET, lateLocal);

    expect(range.to.toISOString()).toBe("2026-08-14T18:30:00.000Z");
  });
});

describe("computeDelta", () => {
  it("reports a rise as up with a percentage", () => {
    expect(computeDelta(150, 100)).toEqual({
      direction: "up",
      percent: 50,
      previousTokens: 100,
    });
  });

  it("reports a fall as down with a negative percentage", () => {
    expect(computeDelta(50, 100)).toEqual({
      direction: "down",
      percent: -50,
      previousTokens: 100,
    });
  });

  it("reports equal values as flat", () => {
    expect(computeDelta(100, 100).direction).toBe("flat");
  });

  it("treats two empty days as flat rather than a rise", () => {
    expect(computeDelta(0, 0)).toEqual({
      direction: "flat",
      percent: 0,
      previousTokens: 0,
    });
  });

  it("omits the percentage when the previous day had no usage", () => {
    expect(computeDelta(500, 0)).toEqual({
      direction: "up",
      percent: null,
      previousTokens: 0,
    });
  });
});

describe("buildDaily", () => {
  const labels = ["2026-08-09", "2026-08-10", "2026-08-11"];

  it("zero-fills days with no rows", () => {
    const daily = buildDaily([row()], labels);

    expect(daily.map((day) => day.totalTokens)).toEqual([0, 30, 0]);
    expect(daily[0].models).toEqual([]);
  });

  it("sums every model recorded on the same day", () => {
    const daily = buildDaily(
      [row(), row({ model: "gemini-flash-latest", requests: 2, totalTokens: 70 })],
      labels,
    );

    expect(daily[1].totalTokens).toBe(100);
    expect(daily[1].requests).toBe(3);
  });

  it("orders a day's models by tokens descending", () => {
    const daily = buildDaily(
      [row(), row({ model: "gemini-flash-latest", totalTokens: 70 })],
      labels,
    );

    expect(daily[1].models.map((model) => model.model)).toEqual([
      "gemini-flash-latest",
      "llama-3.1-8b-instant",
    ]);
  });

  it("compares each day against the day before it", () => {
    const daily = buildDaily(
      [
        row({ day: "2026-08-09", totalTokens: 100 }),
        row({ day: "2026-08-10", totalTokens: 50 }),
      ],
      labels,
    );

    expect(daily[1].delta).toEqual({
      direction: "down",
      percent: -50,
      previousTokens: 100,
    });
  });
});

describe("buildActivity", () => {
  it("returns one entry per label, zero-filled", () => {
    const rows: ActivityDay[] = [
      { date: "2026-08-10", requests: 3, totalTokens: 90 },
    ];
    const activity = buildActivity(rows, ["2026-08-09", "2026-08-10"]);

    expect(activity).toEqual([
      { date: "2026-08-09", requests: 0, totalTokens: 0 },
      { date: "2026-08-10", requests: 3, totalTokens: 90 },
    ]);
  });
});

describe("buildActivityStats", () => {
  function activity(requests: number[]): ActivityDay[] {
    return requests.map((count, index) => ({
      date: `2026-08-${String(index + 1).padStart(2, "0")}`,
      requests: count,
      totalTokens: count * 10,
    }));
  }

  it("finds the longest run of active days", () => {
    expect(buildActivityStats(activity([1, 1, 1, 0, 1, 1])).longestStreak).toBe(3);
  });

  it("counts the current streak back from the last day", () => {
    expect(buildActivityStats(activity([1, 1, 1, 0, 1, 1])).currentStreak).toBe(2);
  });

  it("reports a current streak of zero when the last day is empty", () => {
    expect(buildActivityStats(activity([1, 1, 0])).currentStreak).toBe(0);
  });

  it("averages across every day in the range, not just active ones", () => {
    const stats = buildActivityStats(activity([2, 0, 0, 0]));

    expect(stats.total).toBe(20);
    expect(stats.avgPerDay).toBe(5);
    expect(stats.avgPerWeek).toBe(35);
  });

  it("handles an empty range without dividing by zero", () => {
    expect(buildActivityStats([])).toEqual({
      longestStreak: 0,
      currentStreak: 0,
      avgPerDay: 0,
      avgPerWeek: 0,
      total: 0,
    });
  });
});
