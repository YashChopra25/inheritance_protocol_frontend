export function VaultVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* Outer halo */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(108,70,255,0.45),transparent_60%)] blur-2xl" />

      {/* Orbit ring */}
      <div className="absolute inset-6 rounded-full border border-[var(--border)]">
        <div className="absolute inset-0 animate-spin-slow">
          <span className="absolute left-1/2 -top-1.5 size-3 -translate-x-1/2 rounded-full bg-[var(--neon)] shadow-[0_0_18px_#9efce0]" />
          <span className="absolute -right-1.5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_#b794ff]" />
          <span
            className="absolute left-1/2 -bottom-1.5 size-2 -translate-x-1/2 rounded-full bg-white/80"
            style={{ boxShadow: "0 0 14px rgba(255,255,255,0.7)" }}
          />
        </div>
      </div>

      {/* Inner ring */}
      <div className="absolute inset-16 rounded-full border border-dashed border-[rgba(183,148,255,0.25)]" />

      {/* Vault card */}
      <div className="absolute inset-[18%] rounded-3xl glass-strong glow-ring animate-float-slow">
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--neon)] shadow-[0_0_10px_#9efce0]" />
              <span className="text-xs text-[var(--muted)] uppercase tracking-wider">
                Vault active
              </span>
            </div>
            <span className="font-mono text-[10px] text-[var(--muted)]">
              7H4q…wQ2P
            </span>
          </div>

          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Locked balance
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">
                412.86
              </span>
              <span className="text-sm text-[var(--muted)]">SOL</span>
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>Next ping</span>
              <span className="font-mono text-[var(--foreground)]">
                03d 14h 22m
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="relative h-full rounded-full"
                style={{
                  width: "62%",
                  background:
                    "linear-gradient(90deg, #9efce0, #b794ff 60%, #6c46ff)",
                }}
              >
                <div className="absolute inset-0 animate-shimmer rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>Beneficiaries</span>
              <span className="text-[var(--foreground)]">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ping pulse */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative size-3">
          <span className="absolute inset-0 rounded-full bg-[var(--accent)]" />
          <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-pulse-ring" />
        </div>
      </div>

      {/* Floating chips */}
      <div className="absolute -left-2 sm:-left-6 top-12 rounded-xl glass px-3 py-2 text-xs animate-float-slow [animation-delay:-2s]">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--neon)]" />
          <span className="font-mono text-[var(--muted)]">tx: ping</span>
          <span className="text-[var(--foreground)]">confirmed</span>
        </div>
      </div>
      <div className="absolute -right-2 sm:-right-6 bottom-14 rounded-xl glass px-3 py-2 text-xs animate-float-slow [animation-delay:-4s]">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-[var(--muted)]">Beneficiary</span>
          <span className="font-mono">9xVu…kP1</span>
        </div>
      </div>
    </div>
  );
}
