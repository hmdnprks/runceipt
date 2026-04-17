import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import PaceChart from "@/components/receipt/PaceChart";
import { THEMES } from "@/lib/receipt-config";
import type { ProcessedSplit } from "@/types/strava";

const theme = THEMES[0];

describe("PaceChart", () => {
  it("returns null for empty splits", () => {
    const { container } = render(<PaceChart splits={[]} theme={theme} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when all paces are zero", () => {
    const splits: ProcessedSplit[] = [{ km: 1, pace: "--:--" }];
    const { container } = render(<PaceChart splits={splits} theme={theme} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders bars for valid splits", () => {
    const splits: ProcessedSplit[] = [
      { km: 1, pace: "5:00 /km" },
      { km: 2, pace: "4:50 /km" },
      { km: 3, pace: "5:10 /km" },
    ];
    const { container } = render(<PaceChart splits={splits} theme={theme} />);
    const rects = container.querySelectorAll("rect");
    expect(rects).toHaveLength(3);
  });

  it("renders km labels when splits <= 15", () => {
    const splits: ProcessedSplit[] = [
      { km: 1, pace: "5:00 /km" },
      { km: 2, pace: "4:50 /km" },
    ];
    const { container } = render(<PaceChart splits={splits} theme={theme} />);
    const texts = container.querySelectorAll("text");
    expect(texts).toHaveLength(2);
    expect(texts[0].textContent).toBe("1");
    expect(texts[1].textContent).toBe("2");
  });

  it("hides km labels when splits > 15", () => {
    const splits: ProcessedSplit[] = Array.from({ length: 16 }, (_, i) => ({
      km: i + 1,
      pace: `${5 + (i % 3)}:00 /km`,
    }));
    const { container } = render(<PaceChart splits={splits} theme={theme} />);
    const texts = container.querySelectorAll("text");
    expect(texts).toHaveLength(0);
  });
});
