import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

let rafCalled = false;
beforeEach(() => {
  mockPush.mockReset();
  mockFetch.mockReset();
  rafCalled = false;
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    if (!rafCalled) {
      rafCalled = true;
      cb(0);
    }
    return 1;
  });
  jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

  // jsdom doesn't support SVG path methods
  const mockPoint = { x: 0, y: 0 };
  const origCreateElement = document.createElementNS.bind(document);
  jest.spyOn(document, "createElementNS").mockImplementation((ns, tag) => {
    const el = origCreateElement(ns, tag);
    if (tag === "path") {
      (el as SVGPathElement).getTotalLength = () => 780;
      (el as SVGPathElement).getPointAtLength = () => mockPoint as DOMPoint;
    }
    return el;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Home page", () => {
  it("shows loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText(/LOADING/)).toBeInTheDocument();
  });

  it("redirects to /dashboard when user is authenticated", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve({ accessToken: "tok_123" }) })
    );
    render(<Home />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("renders CTA button when not authenticated", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve({ error: "Unauthorized" }) })
    );
    render(<Home />);
    await waitFor(() => expect(screen.getByText("CONNECT YOUR RUNS")).toBeInTheDocument());
  });

  it("renders CTA button when fetch fails", async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error("network error")));
    render(<Home />);
    await waitFor(() => expect(screen.getByText("CONNECT YOUR RUNS")).toBeInTheDocument());
  });

  it("shows receipt with sample run data on landing", async () => {
    mockFetch.mockImplementation(() => Promise.resolve({ json: () => Promise.resolve({}) }));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getAllByText("5.20 km").length).toBeGreaterThan(0);
    });
  });
});
