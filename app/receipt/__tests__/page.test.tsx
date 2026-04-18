import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReceiptPage from "@/app/receipt/[id]/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "42" }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const meResponse = { name: "Test Runner", image: "", accessToken: "tok" };

const mockActivity = {
  id: 42,
  name: "Evening Run",
  date: "Monday, Jan 15, 2024",
  distance: "10.00 km",
  duration: "50:00",
  avgPace: "5:00 /km",
  calories: 600,
  elevation: "+150m",
  avgHR: 155,
  maxHR: 180,
  cadence: 170,
  isPR: true,
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

beforeEach(() => {
  mockPush.mockReset();
  mockFetch.mockReset();
});

function setupFetch(me: object | null, activity?: object, activityError?: string) {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/auth/me")) {
      return Promise.resolve({ json: () => Promise.resolve(me ?? { error: "Unauthorized" }) });
    }
    if (url.includes("/api/strava/activity/")) {
      if (activityError) {
        return Promise.resolve({ json: () => Promise.resolve({ error: activityError }) });
      }
      return Promise.resolve({ json: () => Promise.resolve({ activity }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
}

describe("Receipt page", () => {
  it("redirects to / when not authenticated", async () => {
    setupFetch(null);
    render(<ReceiptPage />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("shows loading screen while fetching", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<ReceiptPage />);
    expect(screen.getByText("Fetching run data...")).toBeInTheDocument();
  });

  it("shows error screen on fetch failure", async () => {
    setupFetch(meResponse, undefined, "Not Found");
    render(<ReceiptPage />);
    await waitFor(() => {
      expect(screen.getByText(/Not Found/)).toBeInTheDocument();
      expect(screen.getByText("Back to dashboard")).toBeInTheDocument();
    });
  });

  it("renders the receipt with activity data", async () => {
    setupFetch(meResponse, mockActivity);
    render(<ReceiptPage />);
    await waitFor(() => {
      expect(screen.getByText("Evening Run")).toBeInTheDocument();
      expect(screen.getByText("10.00 km")).toBeInTheDocument();
    });
  });

  it("renders theme selector buttons", async () => {
    setupFetch(meResponse, mockActivity);
    render(<ReceiptPage />);
    await waitFor(() => {
      expect(screen.getByText("Thermal")).toBeInTheDocument();
      expect(screen.getByText("Night Run")).toBeInTheDocument();
      expect(screen.getByText("Neon")).toBeInTheDocument();
      expect(screen.getByText("Minimal")).toBeInTheDocument();
    });
  });

  it("renders module toggle buttons", async () => {
    setupFetch(meResponse, mockActivity);
    render(<ReceiptPage />);
    await waitFor(() => {
      expect(screen.getByText("Route Map")).toBeInTheDocument();
      expect(screen.getByText("Key Stats")).toBeInTheDocument();
      expect(screen.getByText("Pace Chart")).toBeInTheDocument();
      expect(screen.getByText("Split Table")).toBeInTheDocument();
    });
  });

  it("toggles a module off and on", async () => {
    setupFetch(meResponse, mockActivity);
    render(<ReceiptPage />);
    await waitFor(() => screen.getByText("Key Stats"));

    // Stats is enabled by default — the receipt should show distance
    expect(screen.getByText("10.00 km")).toBeInTheDocument();

    // Click to toggle off
    fireEvent.click(screen.getByText("Key Stats"));
    // The stat value should disappear from the receipt
    await waitFor(() => {
      expect(screen.queryByText("10.00 km")).not.toBeInTheDocument();
    });

    // Click to toggle back on
    fireEvent.click(screen.getByText("Key Stats"));
    await waitFor(() => {
      expect(screen.getByText("10.00 km")).toBeInTheDocument();
    });
  });

  it("renders action buttons", async () => {
    setupFetch(meResponse, mockActivity);
    render(<ReceiptPage />);
    await waitFor(() => {
      expect(screen.getByText("Animate Print")).toBeInTheDocument();
      expect(screen.getAllByText("Export PNG").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Share").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("navigates back to dashboard via back button", async () => {
    setupFetch(meResponse, mockActivity);
    render(<ReceiptPage />);
    await waitFor(() => screen.getAllByText("All runs"));
    fireEvent.click(screen.getAllByText("All runs")[0]);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("allows editing the run title", async () => {
    setupFetch(meResponse, mockActivity);
    render(<ReceiptPage />);
    await waitFor(() => screen.getByDisplayValue("Evening Run"));

    const input = screen.getByDisplayValue("Evening Run");
    fireEvent.change(input, { target: { value: "My Custom Title" } });

    await waitFor(() => {
      expect(screen.getByText("My Custom Title")).toBeInTheDocument();
    });
  });
});
