# Lax-Stell — Pitch Deck Outline

**Format:** 12 slides (1 opening + 10 content + 1 closing)
**Event:** Stellar Hacks APAC — `⚠️ TODO: confirm exact event name` (README currently reads "Stellar Hacks:(APAC Stellar )", which is malformed)
**Track:** Payment & Consumer Applications / DeFi & Ecosystem Composability
**Network:** Stellar Testnet

---

## How to read this file

Each slide gives: **on-screen copy** (what the audience sees), **visual** (what to put there), and **say** (speaker notes).

Three markers appear throughout:

- `⚠️ TODO` — a fact only you can supply. Left blank on purpose.
- `🚨 NEEDS SOURCE` — a claim that must be backed by real research before it goes on screen.
- `✅ VERIFIED` — checked against the repo; safe to state as-is.

**Nothing in this outline is invented.** Every technical claim traces to the README, the contracts, or the code. The gaps are real gaps, not oversights — filling them with plausible-sounding numbers is the fastest way to lose a judge who checks one of them.

---

## Slide 1 — Cover *(opening)*

**On-screen**

> # Lax-Stell
> ### Your balances, transactions, and orders stay completely private.
>
> Stellar Hacks APAC · Payment & Consumer Applications / DeFi & Ecosystem Composability · Stellar Testnet

**Visual:** Logo centered, hero banner as backdrop. Team name + date in small mono type, bottom edge.

**Say:** Nothing. Let it sit for two seconds, then go to slide 2. Don't read your own title slide.

---

## Slide 2 — Personal Anecdote / Introduce the Problem

**On-screen**

> Sarah runs a remote software studio.
> She pays her contractors in USDC on Stellar.
> Her competitors can read every payment she has ever made.

> **She didn't lose her money. She lost her leverage.**

**Visual:** ⚠️ **Decision needed — read this before building the slide.**

The template calls for *"pictures of story or news article that showcases the problem."* **Sarah is a fictional persona** taken from the README's "Meet Sarah" section. She is not a real person and there is no news article about her.

Do **not** stage this slide to look like real reportage — a screenshot mocked up as a news story is fabricated evidence, and a judge who searches for it will find nothing. Two honest routes:

- **(a)** Present her explicitly as an illustrative composite — label the slide "Illustrative" and use an abstract/icon treatment, no fake bylines or mastheads.
- **(b)** Replace her with a **real** documented incident of on-chain privacy loss (wallet deanonymization, payroll exposure, MEV/front-running of visible orders) and cite the source on-slide.

**(b) is stronger** — a real incident validates the problem in a way a persona cannot. **(a) is fine** if clearly labeled.

**Say:** Walk through Sarah's day concretely. Her contractor rates, her runway, her raise timing — all public, permanently, to anyone with her address. Land on the leverage line and stop.

---

## Slide 3 — Problem Statement

**On-screen**

> Stellar is transparent by design.
> Every payment, every swap, every balance — public and permanently indexed.
>
> For payroll, B2B vendor payments, treasury, and high-volume trading,
> **absolute transparency is a liability.**

**And the existing options all fail:**

| Option | Why it fails |
|---|---|
| Fresh wallet per transaction | Tedious — and funding trails relink them on the public graph |
| Mixers / centralized custodians | Surrender self-custody; third-party and seizure risk |
| Off-chain scaling / sidechains | Abandon Stellar's assets, speed, and liquidity |

**Visual:** The table, built one row at a time. Each row lands as you say it.

**Say:** The point of this slide is that the problem is *not* unsolved for lack of trying — it's that every existing answer costs you something you can't afford to give up. That sets up the question on slide 5.

✅ **VERIFIED** — all three failure modes are the README's own framing (`README.md:70-73`).

---

## Slide 4 — Statistics / Research Validating the Problem

### 🚨 THIS SLIDE IS INTENTIONALLY EMPTY.

This is the slide that decides whether judges believe the problem is real — and it is the one slide that cannot be written from the repo. **No numbers have been supplied here because inventing them would be fabrication.** A single made-up market figure, checked by one judge, discredits the entire deck including the parts that are genuinely strong.

**What to source — with real citations, on-slide:**

- Stablecoin payment / on-chain payroll volume and growth rate
- Institutional adoption surveys naming **privacy** as a blocker to on-chain settlement
- Documented incidents: wallet deanonymization, front-running, MEV against visible orders
- Stellar's own settlement volume — establishes the size of the stake

**Format when filled:** one number per slide-third, large type, source cited beneath each in small mono. Three numbers maximum. A wall of statistics reads as insecurity.

**Next step:** run `/deep-research` to source these properly with citations. Until then, this slide stays blank.

---

## Slide 5 — The Question

**On-screen** — one line, otherwise empty slide:

> # How can we enable privacy-preserving transactions and trades directly on Stellar — without sacrificing self-custody?

**Visual:** Black/dark slide. Type only. No logo, no decoration.

**Say:** Ask it, then pause. This is the hinge of the pitch — everything before builds to it, everything after answers it. Let the silence do the work.

✅ **VERIFIED** — verbatim from `README.md:75`. It's already the sharpest sentence in the project; don't rewrite it.

---

## Slide 6 — Showcase the Solution → **LIVE DEMO**

**On-screen**

> ## One pool. Four flows. One bridge. One rule.
> ### Your balances, transactions, and orders stay completely private.

Assets enter a shielded pool → balances hide behind **Poseidon2 note commitments** in a Merkle tree → every exit from the shielded layer is gated by a **zero-knowledge proof generated on the user's own device**.

| Flow | What stays hidden |
|---|---|
| **Bridge In** (Sepolia → Stellar) | Origin link and details |
| **Shield** (Public → Shielded) | In-pool balance |
| **Private Pay** (Shielded → Shielded) | Amount, asset, sender → receiver link |
| **Swap** (Dark Pool) | Side, size, price, trade match |
| **Withdraw** (Shielded → Public) | Amount, asset, withdraw source |

**The differentiator:** secret inputs — note keys, amounts, blinding factors — **never leave the device**. Full self-custody. No mixer, no custodian, no sidechain.

**Visual:** Single pool diagram at center, five arrows in/out. Build the table row by row.

> ### → LIVE DEMO HERE
> **Order:** Connect → Shield → Pay privately → Swap → Withdraw
> Rehearse this. Have a recorded fallback ready in case the network stalls.

**Say:** "Four flows, one bridge" — the four in-pool flows (Shield, Pay, Swap, Withdraw) all run against the *same* pool; only the circuit and public inputs change. Bridge In is the fifth entry path, from Ethereum.

⚠️ **Note on phrasing:** README line 39 says *"One pool. Four flows"* but then lists **five** bullets; line 80 clarifies that "four" means the in-pool flows only, excluding the bridge. This deck uses **"four flows + one bridge"**, which is accurate. **Worth fixing that line in the README before judges read it.**

---

## Slide 7 — Tech Stack

**On-screen**

| Layer | Technology |
|---|---|
| **Zero-Knowledge** | Noir `1.0.0-beta.9` → **UltraHonk over BN254**, Poseidon2 · proven client-side in WASM, off-thread |
| **Blockchain** | Stellar Testnet (Soroban) + Ethereum Sepolia |
| **Bridge** | **Native BLS12-381** sync-committee verification on Soroban + Merkle-Patricia storage proofs |
| **Frontend** | React 18, Vite, Tailwind, Three.js / React Three Fiber |
| **Wallet** | Freighter (Stellar) + MetaMask (Ethereum) |
| **Matcher** | Off-chain TypeScript order-matching engine |

**Two things worth pausing on:**

1. **Proving happens in the browser.** Not on a server. The secrets are never transmitted — that's what makes self-custody real rather than rhetorical.
2. **BLS12-381 runs natively on Soroban.** Ethereum headers are verified **without SNARK-wrapping** — which is what makes the bridge genuinely trust-minimized. No relayer or custodian holds authority; the relayer is untrusted by construction.

**Visual:** Table. Bold the two lines above.

**Say:** Don't read the table. Say the two pause-points and move on — judges can read.

✅ **VERIFIED** — matches `README.md:217-226` and the contracts.

---

## Slide 8 — How It Works

**On-screen**

**Proof flow (entirely in the browser):**

```
Derive keys → Build circuit inputs → Prove (Noir/UltraHonk) → Submit to Soroban
```

1. **Derive keys** from a wallet signature (cached locally)
2. **Build inputs** from unspent notes, target amounts, recipient
3. **Prove** UltraHonk over BN254 with Poseidon2 — client-side
4. **Submit** the Soroban transaction carrying proof + public inputs

**On-chain:**

```
User ──transact──▶ Pool Contract ──verify proof──▶ UltraHonk Verifier
                        │                                │
                        │◀──────── Ok ───────────────────┘
                        └── spend nullifiers, insert commitments
```

**The key idea:** spending a note reveals only a **nullifier** — enough to prevent double-spend, and nothing else. Not the amount. Not the owner. Not the source.

**Visual:** The two diagrams. Animate the nullifier as the only thing that "escapes" the shielded layer.

**Say:** This is the slide where a technical judge decides if you actually built it. Be precise and be fast — the proof is on slide 9.

---

## Slide 9 — Traction: It's Live, and It's Verifiable

**This is your strongest slide. Most hackathon teams have a mockup. You have proofs verified on-chain.**

**On-screen**

> ## 6 contracts live on Stellar Testnet.
> ## Real ZK proofs, verified inside Soroban.

**Deployed & verified:** Pool + 5 UltraHonk verifiers (`withdraw`, `transfer`, `place_order`, `match_orders`, `cancel_order`)

**End-to-end, with a real Noir/UltraHonk proof** — 14,592-byte proof / 1,760-byte VK, keccak transcript, verified **inside the Soroban contract**:

| Step | Result | Transaction |
|---|---|---|
| **Deposit 1 XLM** | Shielded note at leaf 0, commitment `0f090472…f92d0a` | [`cdaa631c…`](https://stellar.expert/explorer/testnet/tx/cdaa631c68bedd73a7cf469285e21c4d8ece913100baf9ae6f626db542dca614) — **SUCCESS** |
| **Withdraw with ZK proof** | Verified on-chain, nullifier `02e885ea…5f85884`, 1 XLM released | [`d2d2aca3…`](https://stellar.expert/explorer/testnet/tx/d2d2aca363087a082483b905d5e7ae11ede07d934ed9ccfd46ffcfe9c44ad313) — **SUCCESS** |

**Pool contract:** [`CBZNNVUK…62ZHS5RP3`](https://stellar.expert/explorer/testnet/contract/CBZNNVUKTG6YSVT3NGV7MDVL5ZQO5D4KLLIRFAGBCORPH7Q62ZHS5RP3)

**Visual:** Live stellar.expert links, QR code to the pool contract so judges can verify during Q&A.

**Say:** "Don't take my word for it — here are the transaction hashes. Scan and check while I'm still talking." Then stop. That line is worth more than any adjective.

✅ **VERIFIED** — addresses and tx hashes from `README.md:114-131`. **Re-confirm both txs still resolve on stellar.expert the morning of the pitch.**

---

## Slide 10 — Roadmap / What's Next

### ⚠️ TODO — needs your input.

I don't know your actual plans, and a fabricated roadmap doesn't help you — judges ask follow-up questions about roadmaps, and you'd be defending something you never decided.

**Candidate items** (delete what isn't true, add what is):

- Circuit + contract security audit
- Mainnet deployment
- Broader asset support beyond XLM/USDC
- Decentralizing the order matcher
- Mobile / wallet integrations

**Format:** 3 phases maximum, honest time horizons. "Audited and on mainnet in 6 months" is more credible than a 12-item wishlist.

---

## Slide 11 — Team & Ask

### ⚠️ TODO — needs your input.

**Team:** who built this, and the one credential each that makes you the right people for it.

**The ask — be specific.** From the README's footer, the project is already recruiting:

- **Contributors** — cryptographers, Soroban engineers, designers
- Design partners with a real privacy need (payroll, treasury, B2B)
- Grant / funding, if that's the goal

**Say:** Pick *one* primary ask. A slide with three asks gets zero.

---

## Slide 12 — Closing *(ending)*

**On-screen**

> Sarah can give her team a raise
> without announcing it to the world.
>
> # Your balances, transactions, and orders stay completely private.
> ## Lax-Stell

**Links:** GitHub · Pool contract address · Contact

**Visual:** Return to the cover treatment — closes the loop visually.

**Say:** Callback to Sarah, tagline, stop. Do not add a "Thank you / Questions?" slide after this — it deflates the ending. Leave this on screen through Q&A; it keeps your contract address and repo in front of the judges the whole time.

---

## Open items before this deck is ready

| # | Item | Slide | Who |
|---|---|---|---|
| 1 | **Source real statistics with citations** — the deck's biggest gap | 4 | `/deep-research` can do this |
| 2 | Decide: label Sarah as illustrative, or replace with a real cited incident | 2 | You |
| 3 | Roadmap — real phases | 10 | You |
| 4 | Team + single primary ask | 11 | You |
| 5 | Confirm exact hackathon event name (README string is malformed) | 1 | You |
| 6 | Fix README line 39: "Four flows" followed by five bullets | — | Quick fix |
| 7 | Re-verify both testnet tx links resolve on pitch day | 9 | You |
| 8 | Rehearse demo; prepare a recorded fallback | 6 | You |

---

## Delivery notes

- **Total: 12 slides.** For a typical 5-minute hackathon pitch that's ~25 seconds per slide. Slides 5 and 9 deserve to run long; slides 1, 7, and 12 should be nearly instant.
- **The demo is the pitch.** Slides 1–5 exist to make the audience want to see slide 6. Don't let setup eat your demo time.
- **Your unfair advantage is slide 9.** Working, verifiable on-chain proofs at a hackathon are rare. Every earlier slide should be building toward the moment you show that it actually runs.
