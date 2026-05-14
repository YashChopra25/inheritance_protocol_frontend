"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What happens if I forget to ping?",
    a: "You can set a grace period — typically 7 to 30 days — after the inactivity threshold elapses. Within that window, a single ping reactivates the vault and resets the timer. After the grace period, the contract opens for beneficiaries to claim.",
  },
  {
    q: "Can I update beneficiaries later?",
    a: "Yes. While the vault is active, the original owner can add, remove, or reweight beneficiaries with a single signed transaction. Once the trigger fires, the beneficiary list is frozen.",
  },
  {
    q: "Is this legally recognized as a will?",
    a: "VaultWill executes a contract, not a legal will. In most jurisdictions, it's complementary to — not a replacement for — a traditional estate plan. We recommend pairing it with a notarized will that references the vault address so heirs can prove provenance.",
  },
  {
    q: "What if I lose access to my wallet?",
    a: "If you can no longer sign pings, the vault will eventually trigger and transfer to your beneficiaries. To prevent that, set up the optional multisig guardian — a 2-of-3 quorum (yours plus two trusted parties) that can ping or extend on your behalf.",
  },
  {
    q: "Which tokens are supported?",
    a: "SOL and any SPL token. NFTs are supported via the same primitive — designate a beneficiary wallet to inherit the entire token account.",
  },
  {
    q: "What does it cost?",
    a: "Vault deployment is a one-time ~0.012 SOL rent deposit (refundable on close). Pings cost a few hundred lamports each. The protocol itself takes no fee.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight font-semibold gradient-text">
            The questions everyone asks first.
          </h2>
        </div>

        <ul className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li
                key={f.q}
                className={`rounded-2xl glass transition-colors ${
                  isOpen ? "border-[var(--border-strong)]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left"
                >
                  <span className="text-[15px] sm:text-base font-medium">
                    {f.q}
                  </span>
                  <span
                    className={`grid size-7 place-items-center rounded-full border border-[var(--border-strong)] transition-transform ${
                      isOpen ? "rotate-45 bg-[rgba(183,148,255,0.15)]" : ""
                    }`}
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                    >
                      <path
                        d="M8 3v10M3 8h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--muted)]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
