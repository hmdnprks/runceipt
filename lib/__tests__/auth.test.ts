import { getSession, requireSession } from "@/lib/auth";

const mockSession: Record<string, unknown> = {};

jest.mock("iron-session", () => ({
  getIronSession: jest.fn(() => Promise.resolve(mockSession)),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({})),
}));

beforeEach(() => {
  // Reset session between tests
  Object.keys(mockSession).forEach((k) => delete mockSession[k]);
});

describe("getSession", () => {
  it("returns the iron session", async () => {
    mockSession.accessToken = "tok_123";
    const session = await getSession();
    expect(session.accessToken).toBe("tok_123");
  });
});

describe("requireSession", () => {
  it("returns session when accessToken exists", async () => {
    mockSession.accessToken = "tok_abc";
    const session = await requireSession();
    expect(session).not.toBeNull();
    expect(session!.accessToken).toBe("tok_abc");
  });

  it("returns null when no accessToken", async () => {
    const session = await requireSession();
    expect(session).toBeNull();
  });
});
