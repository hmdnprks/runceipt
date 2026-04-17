import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockPush.mockReset();
  mockFetch.mockReset();
});

describe("Home page", () => {
  it("shows loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /dashboard when user is authenticated", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve({ accessToken: "tok_123" }) })
    );
    render(<Home />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("renders login button when not authenticated", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve({ error: "Unauthorized" }) })
    );
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Connect with Strava")).toBeInTheDocument());
  });

  it("renders login button when fetch fails", async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error("network error")));
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Connect with Strava")).toBeInTheDocument());
  });

  it("shows sample distances on landing", async () => {
    mockFetch.mockImplementation(() => Promise.resolve({ json: () => Promise.resolve({}) }));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("5.2 km")).toBeInTheDocument();
      expect(screen.getByText("10.4 km")).toBeInTheDocument();
      expect(screen.getByText("21.1 km")).toBeInTheDocument();
    });
  });
});
