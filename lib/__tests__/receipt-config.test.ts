import {
  THEMES,
  MODULES,
  DEFAULT_CONFIG,
  getTheme,
  MOTIVATIONAL_QUOTES,
} from "@/lib/receipt-config";

describe("THEMES", () => {
  it("has 4 themes", () => {
    expect(THEMES).toHaveLength(4);
  });

  it("each theme has required fields", () => {
    for (const t of THEMES) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("bg");
      expect(t).toHaveProperty("text");
      expect(t).toHaveProperty("accent");
      expect(t).toHaveProperty("font");
    }
  });
});

describe("MODULES", () => {
  it("has 9 modules", () => {
    expect(MODULES).toHaveLength(9);
  });

  it("each module has required fields", () => {
    for (const m of MODULES) {
      expect(m).toHaveProperty("id");
      expect(m).toHaveProperty("label");
      expect(typeof m.defaultEnabled).toBe("boolean");
    }
  });
});

describe("DEFAULT_CONFIG", () => {
  it("has enabledModules matching MODULES defaults", () => {
    for (const m of MODULES) {
      expect(DEFAULT_CONFIG.enabledModules[m.id]).toBe(m.defaultEnabled);
    }
  });

  it("defaults to thermal theme", () => {
    expect(DEFAULT_CONFIG.themeId).toBe("thermal");
  });
});

describe("getTheme", () => {
  it("returns the correct theme by id", () => {
    expect(getTheme("night").id).toBe("night");
    expect(getTheme("neon").label).toBe("Neon");
  });

  it("falls back to first theme for unknown id", () => {
    expect(getTheme("nonexistent" as never).id).toBe("thermal");
  });
});

describe("MOTIVATIONAL_QUOTES", () => {
  it("has at least one quote", () => {
    expect(MOTIVATIONAL_QUOTES.length).toBeGreaterThan(0);
  });

  it("all quotes are non-empty strings", () => {
    for (const q of MOTIVATIONAL_QUOTES) {
      expect(typeof q).toBe("string");
      expect(q.length).toBeGreaterThan(0);
    }
  });
});
