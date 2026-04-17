import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import RouteSVG from "@/components/receipt/RouteSVG";
import { THEMES } from "@/lib/receipt-config";

const theme = THEMES[0];
const VALID_POLYLINE = "_p~iF~ps|U_ulLnnqC";

describe("RouteSVG", () => {
  it("renders fallback path when polyline is empty", () => {
    const { container } = render(<RouteSVG polyline="" theme={theme} />);
    const paths = container.querySelectorAll("path");
    // glow shadow + route line = 2 paths, both using fallback
    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute("d")).toContain("C 35 65");
  });

  it("renders decoded polyline path for valid input", () => {
    const { container } = render(<RouteSVG polyline={VALID_POLYLINE} theme={theme} />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2);
    // Should start with M (moveto) and contain L (lineto), not the fallback curve
    expect(paths[0].getAttribute("d")).toMatch(/^M\s/);
    expect(paths[0].getAttribute("d")).toContain("L");
    expect(paths[0].getAttribute("d")).not.toContain("C 35 65");
  });

  it("renders start and end circles", () => {
    const { container } = render(<RouteSVG polyline={VALID_POLYLINE} theme={theme} />);
    // start: filled + ring = 2, end: filled + inner = 2 → 4 circles
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(4);
  });

  it("renders grid lines", () => {
    const { container } = render(<RouteSVG polyline="" theme={theme} />);
    // 3 horizontal + 3 vertical = 6
    const lines = container.querySelectorAll("line");
    expect(lines).toHaveLength(6);
  });

  it("does not crash on unusual polyline input", () => {
    // Should render without throwing regardless of input
    const { container } = render(<RouteSVG polyline="!!invalid!!" theme={theme} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2);
  });
});
