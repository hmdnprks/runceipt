import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import MiniRoute from "@/components/receipt/MiniRoute";

// A simple encoded polyline for two points: (38.5, -120.2) and (40.7, -120.95)
// Encoded via Google's polyline algorithm
const VALID_POLYLINE = "_p~iF~ps|U_ulLnnqC";

describe("MiniRoute", () => {
  it("returns null for empty polyline", () => {
    const { container } = render(<MiniRoute polyline="" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders an SVG with path and circles for valid polyline", () => {
    const { container } = render(<MiniRoute polyline={VALID_POLYLINE} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(container.querySelector("path")).toBeInTheDocument();
    // start + end circles
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });

  it("returns null when polyline decodes to fewer than 2 points", () => {
    // Single character won't decode to 2 full coords
    // We need a polyline that decodes to exactly 1 point: "??" decodes to (0.00001, 0.00001)
    const { container } = render(<MiniRoute polyline="??" />);
    expect(container.innerHTML).toBe("");
  });
});
