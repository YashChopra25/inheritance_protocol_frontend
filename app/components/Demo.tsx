"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

type Status = "idle" | "active" | "at-risk" | "triggered" | "claimed";

type State = {
  connected: boolean;
  connecting: boolean;
  wallet: string;
  balance: number;
  beneficiary: string;
  amount: string;
  intervalDays: number;
  status: Status;
  lastPingMs: number;
  nowMs: number;
  pinging: boolean;
  claiming: boolean;
  log: { id: number; t: number; msg: string; kind: "info" | "ok" | "warn" | "err" }[];
  logSeq: number;
};

type Action =
  | { type: "tick" }
  | { type: "connect-start" }
  | { type: "connect-done" }
  | { type: "set"; key: keyof State; value: State[keyof State] }
  | { type: "ping-start" }
  | { type: "ping-done" }
  | { type: "force-trigger" }
  | { type: "claim-start" }
  | { type: "claim-done" }
  | { type: "reset" }
  | { type: "log"; msg: string; kind?: "info" | "ok" | "warn" | "err" };

const DEMO_WALLET = "7H4qB2EYAaXk2Lm7tQfGzPvR8sN3w6yCJxKpYdVwQ2P";
const DEMO_BENEFICIARY = "9xVuPq3Tn8eK4mJ2hL5rDc7sFvZbWnAyXqkpTjUkP1";

function shorten(addr: string, head = 4, tail = 4) {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

const INITIAL: State = {
  connected: false,
  connecting: false,
  wallet: "",
  balance: 14.382,
  beneficiary: DEMO_BENEFICIARY,
  amount: "5.00",
  intervalDays: 30,
  status: "idle",
  lastPingMs: 0,
  nowMs: 0,
  pinging: false,
  claiming: false,
  log: [],
  logSeq: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "tick":
      return { ...state, nowMs: Date.now() };
    case "connect-start":
      return { ...state, connecting: true };
    case "connect-done":
      return {
        ...state,
        connecting: false,
        connected: true,
        wallet: DEMO_WALLET,
      };
    case "set":
      return { ...state, [action.key]: action.value } as State;
    case "ping-start":
      return { ...state, pinging: true };
    case "ping-done":
      return {
        ...state,
        pinging: false,
        lastPingMs: Date.now(),
        status: "active",
      };
    case "force-trigger":
      return { ...state, status: "triggered" };
    case "claim-start":
      return { ...state, claiming: true };
    case "claim-done":
      return { ...state, claiming: false, status: "claimed" };
    case "reset":
      return {
        ...INITIAL,
        connected: state.connected,
        wallet: state.wallet,
        nowMs: Date.now(),
      };
    case "log": {
      const next = state.logSeq + 1;
      return {
        ...state,
        logSeq: next,
        log: [
          {
            id: next,
            t: Date.now(),
            msg: action.msg,
            kind: action.kind ?? "info",
          },
          ...state.log,
        ].slice(0, 6),
      };
    }
  }
}

function formatDuration(ms: number) {
  if (ms <= 0) return "00d 00h 00m 00s";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

// Compressed demo time so the countdown feels alive:
// 1 second of real time = 1 hour of "vault" time.
const TIME_COMPRESSION = 60 * 60;

export function Demo() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    dispatch({ type: "tick" });
    tickRef.current = window.setInterval(
      () => dispatch({ type: "tick" }),
      1000
    );
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const totalWindowMs = state.intervalDays * 24 * 60 * 60 * 1000;
  const elapsedRealMs = state.lastPingMs ? state.nowMs - state.lastPingMs : 0;
  const elapsedVaultMs = elapsedRealMs * TIME_COMPRESSION;
  const remainingMs = Math.max(totalWindowMs - elapsedVaultMs, 0);
  const progress =
    state.lastPingMs && totalWindowMs > 0
      ? Math.min(elapsedVaultMs / totalWindowMs, 1)
      : 0;

  // Auto-derive at-risk / triggered status from the countdown.
  useEffect(() => {
    if (!state.lastPingMs) return;
    if (state.status === "triggered" || state.status === "claimed") return;
    if (remainingMs <= 0) {
      dispatch({ type: "set", key: "status", value: "triggered" });
      dispatch({
        type: "log",
        msg: "Inactivity threshold crossed — vault unlocked for beneficiaries.",
        kind: "warn",
      });
    } else if (progress > 0.8 && state.status !== "at-risk") {
      dispatch({ type: "set", key: "status", value: "at-risk" });
      dispatch({
        type: "log",
        msg: "At-risk: < 20% of window remaining. Ping soon.",
        kind: "warn",
      });
    }
  }, [progress, remainingMs, state.lastPingMs, state.status]);

  const connect = useCallback(async () => {
    if (state.connected || state.connecting) return;
    dispatch({ type: "connect-start" });
    dispatch({ type: "log", msg: "Requesting Phantom approval…" });
    await new Promise((r) => setTimeout(r, 850));
    dispatch({ type: "connect-done" });
    dispatch({
      type: "log",
      msg: `Connected ${shorten(DEMO_WALLET)} · 14.382 SOL`,
      kind: "ok",
    });
  }, [state.connected, state.connecting]);

  const ping = useCallback(async () => {
    if (!state.connected || state.pinging) return;
    if (state.status === "triggered" || state.status === "claimed") return;
    dispatch({ type: "ping-start" });
    dispatch({ type: "log", msg: "Signing ping transaction…" });
    await new Promise((r) => setTimeout(r, 700));
    dispatch({ type: "ping-done" });
    dispatch({
      type: "log",
      msg: "Ping confirmed · slot 284,193,712",
      kind: "ok",
    });
  }, [state.connected, state.pinging, state.status]);

  const simulateDeath = useCallback(() => {
    if (state.status === "triggered" || state.status === "claimed") return;
    dispatch({ type: "force-trigger" });
    dispatch({
      type: "log",
      msg: "Simulated long inactivity — vault released.",
      kind: "warn",
    });
  }, [state.status]);

  const claim = useCallback(async () => {
    if (state.status !== "triggered" || state.claiming) return;
    dispatch({ type: "claim-start" });
    dispatch({
      type: "log",
      msg: `Beneficiary ${shorten(state.beneficiary)} claiming…`,
    });
    await new Promise((r) => setTimeout(r, 900));
    dispatch({ type: "claim-done" });
    dispatch({
      type: "log",
      msg: `${state.amount} SOL transferred to beneficiary.`,
      kind: "ok",
    });
  }, [state.amount, state.beneficiary, state.claiming, state.status]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    dispatch({ type: "log", msg: "Vault reset for new simulation.", kind: "info" });
  }, []);

  const statusMeta = useMemo<{
    label: string;
    dot: string;
    text: string;
    bg: string;
    border: string;
  }>(() => {
    switch (state.status) {
      case "active":
        return {
          label: "Active",
          dot: "bg-[var(--neon)] shadow-[0_0_12px_#9efce0]",
          text: "text-[var(--neon)]",
          bg: "bg-[rgba(158,252,224,0.08)]",
          border: "border-[rgba(158,252,224,0.25)]",
        };
      case "at-risk":
        return {
          label: "At Risk",
          dot: "bg-[var(--warn)] shadow-[0_0_12px_#ffb86b]",
          text: "text-[var(--warn)]",
          bg: "bg-[rgba(255,184,107,0.08)]",
          border: "border-[rgba(255,184,107,0.25)]",
        };
      case "triggered":
        return {
          label: "Triggered",
          dot: "bg-[var(--danger)] shadow-[0_0_12px_#ff6b9a]",
          text: "text-[var(--danger)]",
          bg: "bg-[rgba(255,107,154,0.1)]",
          border: "border-[rgba(255,107,154,0.3)]",
        };
      case "claimed":
        return {
          label: "Claimed",
          dot: "bg-[var(--accent)] shadow-[0_0_12px_#b794ff]",
          text: "text-[var(--accent)]",
          bg: "bg-[rgba(183,148,255,0.1)]",
          border: "border-[rgba(183,148,255,0.3)]",
        };
      default:
        return {
          label: "Idle",
          dot: "bg-white/60",
          text: "text-[var(--muted)]",
          bg: "bg-white/[0.04]",
          border: "border-white/10",
        };
    }
  }, [state.status]);

  return (
    <section id="demo" className="relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
              Interactive demo
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight font-semibold gradient-text">
              Walk through a full will lifecycle.
            </h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              Connect a simulated Phantom wallet, configure your vault, and
              ping to stay alive. Or skip the wait — toggle{" "}
              <span className="text-[var(--foreground)]">Simulate Death</span>{" "}
              to instantly unlock the vault and watch your beneficiary claim
              the funds.
            </p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Demo time runs at 3,600× real-time so the countdown is visible.
              No transactions are broadcast.
            </p>

            <div className="mt-8 rounded-xl glass p-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                On-chain log
              </p>
              <ul className="mt-3 space-y-2 font-mono text-[12px]">
                {state.log.length === 0 ? (
                  <li className="text-[var(--muted)]">
                    {"// awaiting wallet connection…"}
                  </li>
                ) : (
                  state.log.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-start gap-2 text-[var(--muted)]"
                    >
                      <span
                        className={
                          l.kind === "ok"
                            ? "text-[var(--neon)]"
                            : l.kind === "warn"
                            ? "text-[var(--warn)]"
                            : l.kind === "err"
                            ? "text-[var(--danger)]"
                            : "text-[var(--accent)]"
                        }
                      >
                        ›
                      </span>
                      <span>
                        <span className="text-[var(--foreground)]/70">
                          {new Date(l.t).toLocaleTimeString([], {
                            hour12: false,
                          })}
                        </span>{" "}
                        {l.msg}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Demo card */}
          <div className="rounded-2xl glass-strong glow-ring p-5 sm:p-7">
            {/* Wallet bar */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[#ab9ff2] to-[#7e6df0]">
                  <svg viewBox="0 0 24 24" className="size-5" fill="white">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 5 3.667 9.142 8.461 9.878.347-.108.633-.31.844-.587.176-.236.317-.604.317-1.143v-2.293s-.49.088-1.07.088c-1.71 0-2.444-1.502-2.444-1.502-.484-1.227-1.18-1.554-1.18-1.554-.967-.66.073-.647.073-.647 1.067.075 1.629 1.097 1.629 1.097.95 1.628 2.49 1.158 3.098.885.096-.689.372-1.158.677-1.424-2.36-.268-4.844-1.18-4.844-5.252 0-1.16.415-2.108 1.095-2.852-.11-.268-.475-1.35.105-2.81 0 0 .892-.286 2.925 1.09a10.18 10.18 0 0 1 2.665-.358c.905.004 1.815.122 2.665.358 2.03-1.376 2.92-1.09 2.92-1.09.585 1.46.22 2.542.11 2.81.68.744 1.09 1.692 1.09 2.852 0 4.082-2.488 4.98-4.856 5.243.382.33.722.972.722 1.96 0 1.416-.013 2.557-.013 2.905 0 .547.14.92.317 1.155.215.282.5.482.85.585A10.005 10.005 0 0 0 22 12Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">Wallet</div>
                  <div className="text-sm font-mono">
                    {state.connected
                      ? shorten(state.wallet)
                      : "Not connected"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {state.connected ? (
                  <div className="text-right">
                    <div className="text-xs text-[var(--muted)]">Balance</div>
                    <div className="text-sm font-mono">
                      {state.balance.toFixed(3)} SOL
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={connect}
                    disabled={state.connecting}
                    className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {state.connecting ? (
                      <>
                        <span className="size-3 mr-2 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      "Connect Phantom"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Beneficiary address">
                <input
                  type="text"
                  value={state.beneficiary}
                  onChange={(e) =>
                    dispatch({
                      type: "set",
                      key: "beneficiary",
                      value: e.target.value,
                    })
                  }
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-[12px] outline-none placeholder:text-[var(--muted)]"
                  placeholder="9xVu…"
                />
              </Field>
              <Field label="Amount (SOL)">
                <input
                  type="text"
                  inputMode="decimal"
                  value={state.amount}
                  onChange={(e) =>
                    dispatch({
                      type: "set",
                      key: "amount",
                      value: e.target.value,
                    })
                  }
                  className="w-full bg-transparent font-mono text-sm outline-none"
                />
                <span className="text-xs text-[var(--muted)] font-mono">
                  ≈ ${(parseFloat(state.amount || "0") * 168.4).toFixed(2)}
                </span>
              </Field>
              <Field label="Ping interval">
                <div className="flex w-full items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={365}
                    value={state.intervalDays}
                    onChange={(e) =>
                      dispatch({
                        type: "set",
                        key: "intervalDays",
                        value: Number(e.target.value),
                      })
                    }
                    className="flex-1 accent-[var(--accent)]"
                  />
                  <span className="font-mono text-sm tabular-nums w-16 text-right">
                    {state.intervalDays}d
                  </span>
                </div>
              </Field>
              <Field label="Network">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">Solana Devnet</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--neon)]">
                    <span className="size-1.5 rounded-full bg-[var(--neon)] shadow-[0_0_8px_#9efce0]" />
                    healthy
                  </span>
                </div>
              </Field>
            </div>

            {/* Status + countdown */}
            <div className="mt-6 rounded-xl bg-white/[0.03] border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full ${statusMeta.bg} ${statusMeta.border} border px-3 py-1 text-xs ${statusMeta.text}`}
                  >
                    <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {state.lastPingMs
                      ? `Last ping ${new Date(
                          state.lastPingMs
                        ).toLocaleTimeString([], { hour12: false })}`
                      : "No pings yet"}
                  </span>
                </div>
                <SimulateDeathToggle
                  active={state.status === "triggered" || state.status === "claimed"}
                  onTrigger={simulateDeath}
                  disabled={!state.connected || state.status === "claimed"}
                />
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    Time until trigger
                  </p>
                  <p className="mt-1 font-mono text-2xl sm:text-3xl tabular-nums">
                    {state.status === "triggered" || state.status === "claimed"
                      ? "00d 00h 00m 00s"
                      : state.lastPingMs
                      ? formatDuration(remainingMs)
                      : `${state.intervalDays.toString().padStart(2, "0")}d 00h 00m 00s`}
                  </p>
                </div>
                <div className="hidden sm:block text-right text-xs text-[var(--muted)]">
                  Window: <span className="font-mono">{state.intervalDays}d</span>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="relative h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${Math.max(progress * 100, state.lastPingMs ? 4 : 0)}%`,
                    background:
                      state.status === "triggered" || state.status === "claimed"
                        ? "linear-gradient(90deg,#ff6b9a,#b794ff)"
                        : state.status === "at-risk"
                        ? "linear-gradient(90deg,#ffb86b,#ff6b9a)"
                        : "linear-gradient(90deg,#9efce0,#b794ff 60%,#6c46ff)",
                  }}
                >
                  <div className="absolute inset-0 animate-shimmer rounded-full" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={ping}
                disabled={
                  !state.connected ||
                  state.pinging ||
                  state.status === "triggered" ||
                  state.status === "claimed"
                }
                className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.pinging ? (
                  <>
                    <span className="size-3 mr-2 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 16 16" className="size-4 mr-2" fill="none">
                      <path
                        d="M8 1.5v3M8 11.5v3M14.5 8h-3M4.5 8h-3M12.6 3.4l-2.1 2.1M5.5 10.5l-2.1 2.1M12.6 12.6l-2.1-2.1M5.5 5.5 3.4 3.4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    Ping Now
                  </>
                )}
              </button>

              {state.status === "triggered" ? (
                <button
                  type="button"
                  onClick={claim}
                  disabled={state.claiming}
                  className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium bg-gradient-to-r from-[#ff6b9a] to-[#b794ff] text-white shadow-[0_10px_30px_-10px_rgba(255,107,154,0.5)] hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.claiming ? (
                    <>
                      <span className="size-3 mr-2 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Claiming…
                    </>
                  ) : (
                    <>Claim as beneficiary →</>
                  )}
                </button>
              ) : null}

              {state.status === "claimed" ? (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--neon)]">
                  <svg viewBox="0 0 16 16" className="size-4" fill="none">
                    <path
                      d="m3 8 3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Funds settled to beneficiary
                </span>
              ) : null}

              <button
                type="button"
                onClick={reset}
                className="ml-auto text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Reset simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-xl bg-white/[0.03] border border-[var(--border)] px-3.5 py-2.5 focus-within:border-[var(--border-strong)] transition-colors">
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-2">{children}</div>
    </label>
  );
}

function SimulateDeathToggle({
  active,
  onTrigger,
  disabled,
}: {
  active: boolean;
  onTrigger: () => void;
  disabled: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (disabled || active) return;
        if (!confirming) {
          setConfirming(true);
          window.setTimeout(() => setConfirming(false), 2500);
          return;
        }
        setConfirming(false);
        onTrigger();
      }}
      disabled={disabled || active}
      className={`group inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs transition-colors ${
        active
          ? "border-[rgba(255,107,154,0.4)] bg-[rgba(255,107,154,0.1)] text-[var(--danger)]"
          : confirming
          ? "border-[rgba(255,184,107,0.4)] bg-[rgba(255,184,107,0.08)] text-[var(--warn)]"
          : "border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[rgba(255,107,154,0.4)]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
      aria-pressed={active}
    >
      <span
        className={`size-2 rounded-full ${
          active ? "bg-[var(--danger)]" : "bg-white/30"
        }`}
      />
      {active
        ? "Inactivity simulated"
        : confirming
        ? "Tap again to confirm"
        : "Simulate Death"}
    </button>
  );
}
