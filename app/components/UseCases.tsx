const cases = [
  {
    tag: "Personal",
    title: "Crypto inheritance",
    body:
      "Pass SOL, USDC, and SPL tokens to family without surrendering keys to a lawyer or exchange.",
    metric: "Avg. setup: 4 min",
  },
  {
    tag: "Cold storage",
    title: "Long-term holdings",
    body:
      "Add a fail-safe to a hardware wallet you only touch once a year. If you stop touching it, your heirs still get it.",
    metric: "1-year ping window",
  },
  {
    tag: "DAO",
    title: "Treasury contingency",
    body:
      "Multisig signer goes silent? Recover treasury control via a predefined inactivity rule, no governance vote needed.",
    metric: "16-of-N beneficiaries",
  },
  {
    tag: "High-net-worth",
    title: "Quiet estate planning",
    body:
      "Distribute eight-figure portfolios across heirs without disclosing balances to intermediaries.",
    metric: "Zero KYC",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
              Use cases
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight font-semibold gradient-text">
              Built for anyone who can&apos;t afford to disappear.
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-sm">
            Four patterns we see most often. The protocol is general — your
            rules can be too.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cases.map((c) => (
            <article
              key={c.title}
              className="group relative overflow-hidden rounded-2xl glass p-6 transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[rgba(183,148,255,0.5)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-[var(--border-strong)] px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {c.tag}
                </span>
                <span className="font-mono text-[10px] text-[var(--muted)]">
                  {c.metric}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-medium tracking-tight">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                {c.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
