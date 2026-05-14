const pillars = [
  {
    title: "Non-custodial by design",
    body:
      "Your seed phrase, your funds. The program holds the lockbox, but only the rules you signed can open it.",
  },
  {
    title: "Smart-contract execution",
    body:
      "Releases are triggered by on-chain time, not a human. There is no off-chain authority that can override your will.",
  },
  {
    title: "Open & auditable logic",
    body:
      "Source verified on Solana Explorer. Two independent audits in progress (OtterSec and Neodyme).",
  },
  {
    title: "Optional multisig guardian",
    body:
      "Add a 2-of-3 guardian quorum that can extend your inactivity window — useful when you travel off-grid.",
  },
];

export function Security() {
  return (
    <section id="security" className="relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--neon)]">
              Security
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight font-semibold gradient-text">
              Trustless, not trust-me.
            </h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              VaultWill executes a contract you read, signed, and can verify
              on-chain. No backdoors, no admin keys, no recovery hotline.
              That&apos;s the point.
            </p>

            <div className="mt-8 rounded-2xl glass p-5 font-mono text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--muted)]">vault_will.rs</span>
                <span className="text-[var(--neon)]">verified</span>
              </div>
              <pre className="overflow-x-auto text-[var(--foreground)]">
{`pub fn release(ctx: Context<Release>) -> Result<()> {
  let vault = &ctx.accounts.vault;
  let now = Clock::get()?.unix_timestamp;
  require!(
    now > vault.last_ping + vault.threshold,
    VaultError::StillAlive
  );
  for b in vault.beneficiaries.iter() {
    transfer(ctx, b.recipient, b.share)?;
  }
  Ok(())
}`}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className="rounded-2xl glass p-6 relative overflow-hidden"
              >
                <span className="absolute right-4 top-4 font-mono text-[10px] text-[var(--muted)]">
                  0{i + 1}
                </span>
                <h3 className="text-base font-medium tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
