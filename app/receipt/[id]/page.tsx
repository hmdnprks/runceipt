"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  Printer,
  Share2,
  AlertTriangle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { ProcessedRun, ModuleId, ThemeId } from "@/types/strava";
import {
  THEMES,
  MODULES,
  DEFAULT_CONFIG,
  MOTIVATIONAL_QUOTES,
  getTheme,
} from "@/lib/receipt-config";
import Receipt from "@/components/receipt/Receipt";

type Me = { name: string; image: string; accessToken: string };

export default function ReceiptPage() {
  const [me, setMe] = useState<Me | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [run, setRun] = useState<ProcessedRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<Record<ModuleId, boolean>>(DEFAULT_CONFIG.enabledModules);
  const [themeId, setThemeId] = useState<ThemeId>("thermal");
  const [printing, setPrinting] = useState(false);
  const [exported, setExported] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/");
          return;
        }
        setMe(data);
      });
  }, [router]);

  useEffect(() => {
    if (!me || !id) return;
    let cancelled = false;
    const fetchActivity = async () => {
      try {
        const r = await fetch(`/api/strava/activity/${id}`);
        const data = await r.json();
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setRun(data.activity);
        setCustomTitle(data.activity.name);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchActivity();
    return () => {
      cancelled = true;
    };
  }, [me, id]);

  const toggleModule = (moduleId: ModuleId) =>
    setEnabled((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => setPrinting(false), 1200);
  };

  const handleExport = async () => {
    if (!receiptRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `run-receipt-${id}.png`;
      a.click();
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const handleShare = async () => {
    if (!receiptRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "run-receipt.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: run?.name ?? "My Run",
              text: `${run?.distance} in ${run?.duration} 🏃 via RunReceipt`,
            });
          } catch (e) {
            if (e instanceof Error && e.name === "AbortError") return;
            console.error("Share failed", e);
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `run-receipt-${id}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  const theme = getTheme(themeId);
  const quote = MOTIVATIONAL_QUOTES[Number(id) % MOTIVATIONAL_QUOTES.length];

  if (!me || loading) return <LoadingScreen />;
  if (error || !run) return <ErrorScreen error={error} onBack={() => router.push("/dashboard")} />;

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  const sidebarContent = (
    <>
      <div style={s.sidebarTitle}>Customize</div>

      {/* Theme */}
      <section style={s.section}>
        <div style={s.sectionLabel}>Theme</div>
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id)}
            style={{
              ...s.themeBtn,
              background: t.bg,
              color: t.text,
              border: themeId === t.id ? `2px solid ${t.accent}` : "2px solid transparent",
              fontFamily: t.font === "serif" ? "Georgia, serif" : "'JetBrains Mono', monospace",
            }}
          >
            {t.label}
            {themeId === t.id && <Check size={10} strokeWidth={2.5} color={t.accent} />}
          </button>
        ))}
      </section>

      {/* Title */}
      <section style={s.section}>
        <div style={s.sectionLabel}>Run Title</div>
        <input
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          maxLength={40}
          style={s.titleInput}
          placeholder="Rename your run..."
        />
      </section>

      {/* Modules */}
      <section style={s.section}>
        <div style={s.sectionLabel}>Metrics</div>
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => toggleModule(m.id)}
            style={{
              ...s.moduleBtn,
              background: enabled[m.id] ? "#252525" : "transparent",
              color: enabled[m.id] ? "#fff" : "#555",
              border: enabled[m.id] ? "1px solid #3a3a3a" : "1px solid #222",
              borderLeft: enabled[m.id] ? "3px solid #6ee7b7" : "3px solid #222",
            }}
          >
            <m.icon size={12} strokeWidth={1.5} />
            <span style={{ flex: 1 }}>{m.label}</span>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: enabled[m.id] ? "#6ee7b7" : "#2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                color: "#111",
              }}
            >
              {enabled[m.id] ? <Check size={8} strokeWidth={2.5} color="#111" /> : null}
            </span>
          </button>
        ))}
      </section>
    </>
  );

  return (
    <div className="rp-root" style={s.root}>
      {/* ── Mobile Header ────────────────────────────────────── */}
      <header className="rp-mobile-header">
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            ...s.backBtn,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: 0,
          }}
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          All runs
        </button>
        <button onClick={() => setCustomizeOpen(true)} className="rp-customize-toggle">
          <SlidersHorizontal size={14} strokeWidth={1.5} />
          Customize
          {enabledCount > 0 && <span className="rp-customize-badge">{enabledCount}</span>}
        </button>
      </header>

      {/* ── Sidebar (desktop) / Drawer (mobile) ──────────────── */}
      <aside className={`rp-sidebar${customizeOpen ? " rp-sidebar--open" : ""}`} style={s.sidebar}>
        {/* Desktop back button */}
        <button
          className="rp-sidebar-back"
          onClick={() => router.push("/dashboard")}
          style={{ ...s.backBtn, display: "flex", alignItems: "center", gap: "4px" }}
        >
          <ArrowLeft size={11} strokeWidth={1.5} />
          All runs
        </button>

        {/* Mobile drawer handle + close */}
        <div className="rp-drawer-handle-row">
          <div className="rp-drawer-handle" />
          <button
            className="rp-drawer-close"
            onClick={() => setCustomizeOpen(false)}
            aria-label="Close customize panel"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {sidebarContent}

        {/* Desktop-only action buttons */}
        <div className="rp-sidebar-actions" style={s.actions}>
          <button
            onClick={handlePrint}
            style={{
              ...s.printBtn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Printer size={11} strokeWidth={1.5} />
            Animate Print
          </button>
          <button
            onClick={handleExport}
            style={{
              ...s.exportBtn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {exported ? (
              <>
                <Check size={11} strokeWidth={2} />
                Saved!
              </>
            ) : (
              <>
                <Download size={11} strokeWidth={1.5} />
                Export PNG
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            style={{
              ...s.exportBtn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Share2 size={11} strokeWidth={1.5} />
            Share
          </button>
        </div>
      </aside>

      {/* ── Drawer overlay ───────────────────────────────────── */}
      {customizeOpen && <div className="rp-overlay" onClick={() => setCustomizeOpen(false)} />}

      {/* ── Receipt Preview ───────────────────────────────────── */}
      <main className="rp-preview" style={s.preview}>
        <div style={s.previewLabel}>Live Preview</div>

        {/* Printer slot */}
        <div style={s.printerSlot}>
          <div style={s.printerRoller} />
          <div style={s.printerPaperSlot} />
          <div style={s.printerRoller} />
        </div>

        {/* Animated receipt */}
        <div
          style={{
            ...s.receiptWrap,
            animation: printing ? "printSlide 0.9s cubic-bezier(0.4,0,0.2,1) forwards" : "none",
          }}
        >
          <div ref={receiptRef}>
            <Receipt
              run={{ ...run, name: customTitle || run.name }}
              enabled={enabled}
              theme={theme}
              quote={quote}
            />
          </div>
          {/* Torn bottom edge */}
          <div style={{ ...s.tornEdge, background: theme.bg }} />
        </div>

        <p style={s.hint}>Customize · Animate · Export · Share</p>
      </main>

      {/* ── Mobile bottom action bar ─────────────────────────── */}
      <div className="rp-mobile-actions">
        <button className="rp-action-btn rp-action-btn--secondary" onClick={handlePrint}>
          <Printer size={14} strokeWidth={1.5} />
          Animate
        </button>
        <button className="rp-action-btn rp-action-btn--primary" onClick={handleExport}>
          {exported ? (
            <>
              <Check size={14} strokeWidth={2} />
              Saved!
            </>
          ) : (
            <>
              <Download size={14} strokeWidth={1.5} />
              Export PNG
            </>
          )}
        </button>
        <button className="rp-action-btn rp-action-btn--primary" onClick={handleShare}>
          <Share2 size={14} strokeWidth={1.5} />
          Share
        </button>
      </div>

      <style>{`
        /* ── Responsive layout ────────────────────────────────── */
        .rp-root {
          flex-direction: row;
        }
        .rp-mobile-header {
          display: none;
        }
        .rp-mobile-actions {
          display: none;
        }
        .rp-overlay {
          display: none;
        }
        .rp-sidebar-back {
          display: flex !important;
        }
        .rp-sidebar-actions {
          display: flex;
        }
        .rp-drawer-handle-row {
          display: none;
        }

        @media (max-width: 767px) {
          .rp-root {
            flex-direction: column;
            padding-bottom: 72px;
          }

          /* Fixed top header */
          .rp-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: #181818;
            border-bottom: 1px solid #252525;
            padding: 12px 16px;
            height: 52px;
            box-sizing: border-box;
          }

          /* Customize toggle button in header */
          .rp-customize-toggle {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #252525;
            border: 1px solid #333;
            color: #ccc;
            border-radius: 6px;
            padding: 6px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            cursor: pointer;
            letter-spacing: 0.06em;
            position: relative;
          }

          /* Active modules badge on Customize button */
          .rp-customize-badge {
            background: #6ee7b7;
            color: #111;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            min-width: 16px;
            text-align: center;
          }

          /* Preview: scroll area, account for fixed header + bottom bar */
          .rp-preview {
            padding-top: 72px !important;
            padding-bottom: 20px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          /* Sidebar becomes bottom drawer */
          .rp-sidebar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            min-width: unset !important;
            max-height: 78vh !important;
            transform: translateY(100%);
            transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 90;
            border-right: none !important;
            border-top: 1px solid #333 !important;
            border-radius: 16px 16px 0 0 !important;
            overflow-y: auto !important;
            padding: 0 18px 24px !important;
            box-sizing: border-box;
          }
          .rp-sidebar--open {
            transform: translateY(0) !important;
          }

          /* Drawer handle bar */
          .rp-drawer-handle-row {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 0 8px;
            position: relative;
          }
          .rp-drawer-handle {
            width: 36px;
            height: 4px;
            background: #333;
            border-radius: 2px;
          }
          .rp-drawer-close {
            position: absolute;
            right: 0;
            background: none;
            border: none;
            color: #555;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
          }

          /* Hide back button inside drawer on mobile */
          .rp-sidebar-back {
            display: none !important;
          }

          /* Hide action buttons inside drawer on mobile */
          .rp-sidebar-actions {
            display: none !important;
          }

          /* Semi-transparent overlay */
          .rp-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 80;
            background: rgba(0, 0, 0, 0.55);
          }

          /* Fixed bottom action bar */
          .rp-mobile-actions {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 70;
            background: #181818;
            border-top: 1px solid #252525;
            padding: 10px 12px;
            padding-bottom: max(10px, env(safe-area-inset-bottom));
            gap: 8px;
            box-sizing: border-box;
          }
          .rp-action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            border-radius: 8px;
            padding: 11px 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.06em;
            cursor: pointer;
            border: none;
          }
          .rp-action-btn--secondary {
            background: #252525;
            color: #ccc;
            border: 1px solid #333 !important;
          }
          .rp-action-btn--primary {
            background: #6ee7b7;
            color: #111;
          }
        }

        /* ── Animations ─────────────────────────────────────── */
        @keyframes printSlide {
          0%   { transform: translateY(-110%); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(0);     opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          color: "#888",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.12em",
        }}
      >
        Fetching run data...
      </p>
    </div>
  );
}

function ErrorScreen({ error, onBack }: { error: string | null; onBack: () => void }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <p
        style={{
          color: "#ff6b6b",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <AlertTriangle size={14} strokeWidth={1.5} />
        {error ?? "Activity not found"}
      </p>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "none",
          border: "1px solid #333",
          color: "#888",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <ArrowLeft size={11} strokeWidth={1.5} />
        Back to dashboard
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#111",
    display: "flex",
    fontFamily: "'JetBrains Mono', monospace",
  },
  sidebar: {
    width: "260px",
    minWidth: "260px",
    background: "#181818",
    borderRight: "1px solid #222",
    padding: "24px 18px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#555",
    fontSize: "11px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    textAlign: "left",
    padding: "0",
    marginBottom: "20px",
    letterSpacing: "0.08em",
  },
  sidebarTitle: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    marginBottom: "20px",
  },
  section: { marginBottom: "22px" },
  sectionLabel: {
    color: "#555",
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  themeBtn: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderRadius: "4px",
    padding: "8px 10px",
    fontSize: "10px",
    cursor: "pointer",
    marginBottom: "5px",
    letterSpacing: "0.06em",
  },
  titleInput: {
    width: "100%",
    background: "#111",
    border: "1px solid #2a2a2a",
    color: "#ccc",
    borderRadius: "4px",
    padding: "8px 10px",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    boxSizing: "border-box",
  },
  moduleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    borderRadius: "3px",
    padding: "8px 10px",
    fontSize: "10px",
    cursor: "pointer",
    marginBottom: "5px",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.12s",
  },
  actions: {
    marginTop: "auto",
    paddingTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  printBtn: {
    background: "#252525",
    color: "#ccc",
    border: "1px solid #333",
    borderRadius: "4px",
    padding: "11px",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.1em",
  },
  exportBtn: {
    background: "#6ee7b7",
    color: "#111",
    border: "none",
    borderRadius: "4px",
    padding: "11px",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.1em",
  },
  preview: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 40px 60px",
    overflowY: "auto",
  },
  previewLabel: {
    color: "#333",
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: "20px",
  },
  printerSlot: {
    background: "#1e1e1e",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    padding: "10px 28px 6px",
    marginBottom: "-2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    zIndex: 10,
    position: "relative",
  },
  printerRoller: { width: "36px", height: "3px", background: "#2a2a2a", borderRadius: "2px" },
  printerPaperSlot: {
    width: "90px",
    height: "5px",
    background: "#252525",
    borderRadius: "2px",
    border: "1px solid #333",
  },
  receiptWrap: { position: "relative" },
  tornEdge: {
    height: "14px",
    width: "320px",
    clipPath:
      "polygon(0% 0%, 3% 100%, 6% 0%, 9% 100%, 12% 0%, 15% 100%, 18% 0%, 21% 100%, 24% 0%, 27% 100%, 30% 0%, 33% 100%, 36% 0%, 39% 100%, 42% 0%, 45% 100%, 48% 0%, 51% 100%, 54% 0%, 57% 100%, 60% 0%, 63% 100%, 66% 0%, 69% 100%, 72% 0%, 75% 100%, 78% 0%, 81% 100%, 84% 0%, 87% 100%, 90% 0%, 93% 100%, 96% 0%, 100% 100%, 100% 0%)",
  },
  hint: {
    color: "#2a2a2a",
    fontSize: "9px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginTop: "20px",
  },
};
