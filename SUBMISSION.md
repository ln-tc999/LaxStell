# Hackathon Submission — Lax-Stell

> Stellar Hacks: Real-World ZK. Draft answers for the submission form.
> **TODO before submitting:** fill in team member names (Q5) and confirm country (Q6) & track (Q8).

---

## 1. Project Name

**Lax-Stell**

## 2. Problem Statement

Public blockchains are permanent and fully transparent by default. On Stellar, as on every open
ledger, anyone with an address can see your entire financial life — balances, amounts, counterparties,
salaries, trades — forever. For real payments and trading this is disqualifying: businesses leak
payroll and supplier terms, individuals expose their net worth, and traders broadcast their positions
to be front-run. The ledger never forgets, and today "privacy" on-chain usually means trusting a
mixer, a custodian, or an off-chain server. There is no native way to hold, pay, and trade on Stellar
where amounts and parties stay hidden yet every transaction is still provably valid on-chain.

## 3. Proposed Solution

Lax-Stell is a full-privacy layer on Stellar. Assets are bridged into a shielded pool where each
balance is a Poseidon2 commitment "note" in an append-only Merkle tree — amount and owner live inside
the hash, only the tree root is public. Every state transition *out* of the shielded layer (withdraw,
transfer, place/match/cancel order) is gated by an **UltraHonk (Noir) zero-knowledge proof verified
inside a Soroban smart contract** over BN254/Poseidon2. Without a valid proof, no funds move; a spend
reveals only a nullifier, so old and new notes never link. On top of this sit four surfaces: Bridge,
private Pay, Portfolio, and a zero-knowledge **dark pool** where orders are matched blind. It is
**live on Stellar testnet** — a real deposit→withdraw round-trip is verified on-chain
(withdraw tx `d2d2aca3…`).

## 4. Target Users / Audience

1. **Individuals & consumers** who want money on Stellar that behaves like cash — receive, hold, and
   pay without broadcasting balances or counterparties.
2. **Businesses & DAOs** that need confidential payroll, supplier payments, and treasury movements on
   a public chain.
3. **Traders & market makers** who want to trade without leaking size or side, via the ZK dark pool.
4. **Builders**, who can compose on the shielded layer as a reusable privacy primitive.

The common need: the auditability and settlement of a public ledger, without the surveillance.

## 5. Team Member Names & Roles

<!-- Fill in real names before submitting. If solo, keep one line. -->

- `<Full Name>` — Founder / Full-stack & ZK engineer (Noir circuits, Soroban contracts, SDK, frontend)
- `<Name, optional>` — `<role, e.g. Smart contracts / Cryptography / Design>`

## 6. Which country are you located?

**Indonesia** <!-- confirm / change: Vietnam | Philippines | Indonesia -->

## 7. Expected Stellar Integration

Lax-Stell is built natively on Soroban and Stellar's Protocol 25–26 cryptography:

- **On-chain ZK verification:** five UltraHonk verifier contracts (one per circuit) verify Noir proofs
  over **BN254** directly in Soroban — the privacy is enforced by the chain, not a server.
- **Poseidon2 + Merkle state** kept entirely in a Soroban contract (commitments, nullifier set,
  100-root history ring buffer).
- **SAC integration:** classic Stellar assets (XLM, USDC…) flow in/out of the shielded pool via the
  Stellar Asset Contract.
- **Trust-minimized Ethereum→Stellar bridge:** Ethereum sync-committee **BLS12-381** signatures are
  verified *natively* on Soroban (no SNARK-wrap, thanks to Stellar's native BLS), plus in-contract
  Merkle-Patricia storage proofs — assets locked on Ethereum arrive as shielded notes.
- Already deployed and proof-verified on **Stellar testnet**.

## 8. Hackathon Track

**Recommended: Payment & Consumer Applications** — the core is "private money you hold, receive, and
pay", the fullest end-to-end demo (deposit → pay → withdraw, all live).

**Strong alternative: DeFi & Ecosystem Composability** — if emphasizing the ZK dark pool + the
trust-minimized bridge + the shielded layer as a composable privacy primitive.

<!-- Pick one: Local Finance & Real World Access | DeFi & Ecosystem Composability | Payment & Consumer Applications -->

---

## Evidence (live on testnet)

- Pool: `CBZNNVUKTG6YSVT3NGV7MDVL5ZQO5D4KLLIRFAGBCORPH7Q62ZHS5RP3`
- Deposit tx: `cdaa631c68bedd73a7cf469285e21c4d8ece913100baf9ae6f626db542dca614`
- Withdraw (real ZK proof) tx: `d2d2aca363087a082483b905d5e7ae11ede07d934ed9ccfd46ffcfe9c44ad313`
- Reproduce: `source ./env.sh && scripts/e2e.sh`

See [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) for full contract IDs and transactions.
