import { sessionOptions } from "@/lib/session";

describe("sessionOptions", () => {
  it("has the correct cookie name", () => {
    expect(sessionOptions.cookieName).toBe("run-receipt-session");
  });

  it("sets secure cookies based on NODE_ENV", () => {
    expect(sessionOptions.cookieOptions?.secure).toBe(process.env.NODE_ENV === "production");
  });
});
