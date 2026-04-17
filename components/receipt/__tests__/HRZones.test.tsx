import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HRZones from "@/components/receipt/HRZones";
import { THEMES } from "@/lib/receipt-config";
import type { HRZone } from "@/types/strava";

const theme = THEMES[0];

describe("HRZones", () => {
  it("renders zones with pct > 0", () => {
    const zones: HRZone[] = [
      { zone: "Z2 Fat Burn", pct: 30, color: "#34d399" },
      { zone: "Z3 Aerobic", pct: 70, color: "#f59e0b" },
    ];
    render(<HRZones zones={zones} theme={theme} />);
    expect(screen.getByText("Z2 Fat Burn")).toBeInTheDocument();
    expect(screen.getByText("Z3 Aerobic")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("filters out zones with 0%", () => {
    const zones: HRZone[] = [
      { zone: "Z1 Easy", pct: 0, color: "#6ee7b7" },
      { zone: "Z3 Aerobic", pct: 100, color: "#f59e0b" },
    ];
    render(<HRZones zones={zones} theme={theme} />);
    expect(screen.queryByText("Z1 Easy")).not.toBeInTheDocument();
    expect(screen.getByText("Z3 Aerobic")).toBeInTheDocument();
  });

  it("renders nothing visible when all zones are 0%", () => {
    const zones: HRZone[] = [
      { zone: "Z1 Easy", pct: 0, color: "#6ee7b7" },
      { zone: "Z2 Fat Burn", pct: 0, color: "#34d399" },
    ];
    const { container } = render(<HRZones zones={zones} theme={theme} />);
    expect(container.textContent).toBe("");
  });
});
