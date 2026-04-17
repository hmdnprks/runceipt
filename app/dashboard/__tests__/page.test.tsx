import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "@/app/dashboard/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const meResponse = {
  name: "Test Runner",
  image: "https://example.com/avatar.jpg",
  accessToken: "tok",
};

const mockActivities = [
  {
    id: 1,
    name: "Morning Run",
    date: "Mon, Jan 15",
    distance: "10.00 km",
    duration: "50:00",
    avgPace: "5:00 /km",
    elevation: "+150m",
    isPR: false,
    summaryPolyline: "",
    calories: 500,
    cadence: 170,
  },
  {
    id: 2,
    name: "PR Run",
    date: "Tue, Jan 16",
    distance: "5.00 km",
    duration: "22:00",
    avgPace: "4:24 /km",
    elevation: "+50m",
    isPR: true,
    summaryPolyline: "",
    calories: 300,
    cadence: 180,
  },
];

beforeEach(() => {
  mockPush.mockReset();
  mockFetch.mockReset();
});

function setupFetch(me: object | null, activities: object[] = [], activitiesError?: string) {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/auth/me")) {
      return Promise.resolve({ json: () => Promise.resolve(me ?? { error: "Unauthorized" }) });
    }
    if (url.includes("/api/strava/activities")) {
      if (activitiesError) {
        return Promise.resolve({ json: () => Promise.resolve({ error: activitiesError }) });
      }
      return Promise.resolve({ json: () => Promise.resolve({ activities, page: 1, perPage: 20 }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
}

describe("Dashboard page", () => {
  it("redirects to / when not authenticated", async () => {
    setupFetch(null);
    render(<Dashboard />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("renders user name and sign out button", async () => {
    setupFetch(meResponse, mockActivities);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Test Runner")).toBeInTheDocument();
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });
  });

  it("renders activity cards", async () => {
    setupFetch(meResponse, mockActivities);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Morning Run")).toBeInTheDocument();
      expect(screen.getByText("PR Run")).toBeInTheDocument();
    });
  });

  it("shows PR badge on PR activities", async () => {
    setupFetch(meResponse, mockActivities);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("PR")).toBeInTheDocument();
    });
  });

  it("shows error message on fetch failure", async () => {
    setupFetch(meResponse, [], "Rate limit exceeded");
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument();
    });
  });

  it("shows empty state when no activities", async () => {
    setupFetch(meResponse, []);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/No runs found/)).toBeInTheDocument();
    });
  });

  it("shows load more button when there are 20 activities", async () => {
    const twentyActivities = Array.from({ length: 20 }, (_, i) => ({
      ...mockActivities[0],
      id: i + 1,
      name: `Run ${i + 1}`,
    }));
    setupFetch(meResponse, twentyActivities);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Load more runs")).toBeInTheDocument();
    });
  });

  it("navigates to receipt page on card click", async () => {
    setupFetch(meResponse, mockActivities);
    render(<Dashboard />);
    await waitFor(() => screen.getByText("Morning Run"));
    const ctaButtons = screen.getAllByText("Generate receipt");
    ctaButtons[0].closest("button")?.click();
    expect(mockPush).toHaveBeenCalledWith("/receipt/1");
  });
});
