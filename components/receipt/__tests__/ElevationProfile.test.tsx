import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import ElevationProfile from "@/components/receipt/ElevationProfile";
import { THEMES } from "@/lib/receipt-config";

const theme = THEMES[0];

describe("ElevationProfile", () => {
  it("renders an SVG with area and line paths", () => {
    const { container } = render(
      <ElevationProfile data={[5, 10, -3, 8]} theme={theme} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const paths = container.querySelectorAll("path");
    // area path + line path
    expect(paths).toHaveLength(2);
  });

  it("line path starts with M and contains L", () => {
    const { container } = render(
      <ElevationProfile data={[5, 10, -3]} theme={theme} />
    );
    const paths = container.querySelectorAll("path");
    const linePath = paths[1].getAttribute("d")!;
    expect(linePath).toMatch(/^M\s/);
    expect(linePath).toContain("L");
  });

  it("area path ends with Z (closed)", () => {
    const { container } = render(
      <ElevationProfile data={[5, -2]} theme={theme} />
    );
    const paths = container.querySelectorAll("path");
    const areaPath = paths[0].getAttribute("d")!;
    expect(areaPath).toMatch(/Z$/);
  });

  it("handles single data point without crashing", () => {
    const { container } = render(
      <ElevationProfile data={[5]} theme={theme} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
