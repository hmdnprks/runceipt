import { fetchActivities, fetchActivity } from "@/lib/strava";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchActivities", () => {
  it("returns filtered run activities", async () => {
    const activities = [
      { id: 1, sport_type: "Run", name: "Morning Run" },
      { id: 2, sport_type: "Ride", name: "Bike Ride" },
      { id: 3, sport_type: "TrailRun", name: "Trail" },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(activities),
    });

    const result = await fetchActivities("token123");
    expect(result).toHaveLength(2);
    expect(result[0].sport_type).toBe("Run");
    expect(result[1].sport_type).toBe("TrailRun");
  });

  it("passes page and perPage params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchActivities("token", 2, 10);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("page=2&per_page=10"),
      expect.any(Object)
    );
  });

  it("sends authorization header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchActivities("my_token");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Authorization: "Bearer my_token" },
      })
    );
  });

  it("throws on non-ok response with API message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Rate limit exceeded" }),
    });

    await expect(fetchActivities("token")).rejects.toThrow("Rate limit exceeded");
  });

  it("throws default message when API error has no message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("parse error")),
    });

    await expect(fetchActivities("token")).rejects.toThrow("Failed to fetch Strava activities");
  });
});

describe("fetchActivity", () => {
  it("returns activity data", async () => {
    const activity = { id: 42, name: "Evening Run" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(activity),
    });

    const result = await fetchActivity("token", 42);
    expect(result).toEqual(activity);
  });

  it("calls correct URL with activity ID", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await fetchActivity("token", 999);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/activities/999"),
      expect.any(Object)
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Not Found" }),
    });

    await expect(fetchActivity("token", 1)).rejects.toThrow("Not Found");
  });

  it("throws default message when API error has no message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("parse error")),
    });

    await expect(fetchActivity("token", 1)).rejects.toThrow("Failed to fetch activity");
  });
});
