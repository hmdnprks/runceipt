import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Receipt from "@/components/receipt/Receipt";
import { THEMES } from "@/lib/receipt-config";
import type { ProcessedRun, ModuleId } from "@/types/strava";

const theme = THEMES[0]; // thermal

const baseRun: ProcessedRun = {
  id: 1,
  name: "Morning Run",
  date: "Monday, Jan 15, 2024",
  distance: "10.00 km",
  duration: "50:00",
  avgPace: "5:00 /km",
  calories: 600,
  elevation: "+150m",
  avgHR: 155,
  maxHR: 180,
  cadence: 170,
  isPR: false,
  summaryPolyline: "",
  splits: [
    { km: 1, pace: "5:00 /km", hr: 150, elevationDiff: 5 },
    { km: 2, pace: "4:50 /km", hr: 160, elevationDiff: -2 },
  ],
  hrZones: [
    { zone: "Z3 Aerobic", pct: 60, color: "#f59e0b" },
    { zone: "Z4 Threshold", pct: 40, color: "#f97316" },
  ],
  elevationProfile: [5, -2],
};

const allEnabled: Record<ModuleId, boolean> = {
  route: true,
  stats: true,
  pace_chart: true,
  elevation: true,
  hr_zones: true,
  splits: true,
  weather: true,
  pr_badge: true,
  quote: true,
};

const allDisabled: Record<ModuleId, boolean> = Object.fromEntries(
  Object.keys(allEnabled).map((k) => [k, false])
) as Record<ModuleId, boolean>;

describe("Receipt", () => {
  it("renders run name and date", () => {
    render(<Receipt run={baseRun} enabled={allDisabled} theme={theme} quote="" />);
    expect(screen.getByText("Morning Run")).toBeInTheDocument();
    expect(screen.getByText("Monday, Jan 15, 2024")).toBeInTheDocument();
  });

  it("shows PR badge only when enabled and isPR", () => {
    const { rerender } = render(
      <Receipt run={{ ...baseRun, isPR: true }} enabled={allEnabled} theme={theme} quote="" />
    );
    // Award icon rendered as SVG when isPR
    const header = screen.getByText("Morning Run").closest("div");
    expect(header?.querySelector("svg")).toBeInTheDocument();

    rerender(
      <Receipt run={{ ...baseRun, isPR: false }} enabled={allEnabled} theme={theme} quote="" />
    );
    expect(header?.querySelector("svg")).not.toBeInTheDocument();
  });

  it("hides stats section when disabled", () => {
    render(<Receipt run={baseRun} enabled={allDisabled} theme={theme} quote="" />);
    expect(screen.queryByText("Distance")).not.toBeInTheDocument();
    expect(screen.queryByText("10.00 km")).not.toBeInTheDocument();
  });

  it("shows stats section when enabled", () => {
    render(
      <Receipt run={baseRun} enabled={{ ...allDisabled, stats: true }} theme={theme} quote="" />
    );
    expect(screen.getByText("10.00 km")).toBeInTheDocument();
    expect(screen.getByText("50:00")).toBeInTheDocument();
    expect(screen.getByText("600 kcal")).toBeInTheDocument();
    expect(screen.getByText("+150m")).toBeInTheDocument();
  });

  it("shows quote only when enabled", () => {
    const quote = "Pain is temporary.";
    const { rerender } = render(
      <Receipt
        run={baseRun}
        enabled={{ ...allDisabled, quote: true }}
        theme={theme}
        quote={quote}
      />
    );
    expect(screen.getByText(`\u201c${quote}\u201d`)).toBeInTheDocument();

    rerender(<Receipt run={baseRun} enabled={allDisabled} theme={theme} quote={quote} />);
    expect(screen.queryByText(`\u201c${quote}\u201d`)).not.toBeInTheDocument();
  });

  it("shows HR summary when stats enabled and HR data exists", () => {
    render(
      <Receipt run={baseRun} enabled={{ ...allDisabled, stats: true }} theme={theme} quote="" />
    );
    expect(screen.getByText(/avg 155/)).toBeInTheDocument();
    expect(screen.getByText(/max 180/)).toBeInTheDocument();
  });

  it("hides HR summary when no HR data", () => {
    const noHR = { ...baseRun, avgHR: undefined, maxHR: undefined };
    render(<Receipt run={noHR} enabled={{ ...allDisabled, stats: true }} theme={theme} quote="" />);
    expect(screen.queryByText(/avg/)).not.toBeInTheDocument();
  });

  it("renders footer", () => {
    render(<Receipt run={baseRun} enabled={allDisabled} theme={theme} quote="" />);
    expect(screen.getByText("runceipt.app")).toBeInTheDocument();
  });
});
