import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SplitsTable from "@/components/receipt/SplitsTable";
import { THEMES } from "@/lib/receipt-config";
import type { ProcessedSplit } from "@/types/strava";

const theme = THEMES[0];

const splits: ProcessedSplit[] = [
  { km: 1, pace: "5:10 /km", hr: 150, elevationDiff: 5 },
  { km: 2, pace: "4:50 /km", hr: 160, elevationDiff: -3 },
  { km: 3, pace: "5:00 /km", hr: 155, elevationDiff: 0 },
];

describe("SplitsTable", () => {
  it("renders all splits", () => {
    render(<SplitsTable splits={splits} theme={theme} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("highlights fastest split with a bolt icon", () => {
    render(<SplitsTable splits={splits} theme={theme} />);
    // km 2 is fastest (4:50) — Zap SVG icon rendered as aria-hidden
    const fastCell = screen.getByText("4:50").closest("td");
    expect(fastCell?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders HR values", () => {
    render(<SplitsTable splits={splits} theme={theme} />);
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("160")).toBeInTheDocument();
  });

  it("shows — for missing HR", () => {
    const noHR: ProcessedSplit[] = [{ km: 1, pace: "5:00 /km", elevationDiff: 0 }];
    render(<SplitsTable splits={noHR} theme={theme} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats positive elevation with +", () => {
    render(<SplitsTable splits={splits} theme={theme} />);
    expect(screen.getByText("+5m")).toBeInTheDocument();
  });

  it("formats negative elevation without +", () => {
    render(<SplitsTable splits={splits} theme={theme} />);
    expect(screen.getByText("-3m")).toBeInTheDocument();
  });
});
