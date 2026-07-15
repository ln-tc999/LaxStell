# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Lax-Stell** — a full-privacy platform on Stellar (hackathon submission, live on testnet). Assets are
bridged into a shielded layer of Poseidon2 commitment notes; withdraws, transfers, and dark-pool
order operations are each gated by an **UltraHonk (Noir) zero-knowledge proof verified inside a
Soroban contract**. There is also a trust-minimized Ethereum→Stellar bridge that verifies Ethereum
sync-committee BLS signatures natively on Soroban.

Despite the `WEB/website/lax-stell` path, this is **not** a website/WordPress project — ignore the
Bricks/Framer/Figma tooling for this repo.

## Toolchain — pinned, do NOT upgrade

`source ./env.sh` before any `nargo`/`bb`/`stellar`/`cargo` work. The versions are exact matches for
the on-chain `rs-soroban-ultrahonk` verifier and are load-bearing:

| Tool | Version | Why it matters |
|------|---------|----------------|
| `nargo` (Noir) | `1.0.0-beta.9` | Produces the **14,592-byte proof / 1,760-byte VK** the verifier accepts. Newer beta.22 / bb 5.0.0 produce different sizes the verifier **rejects**. |
| `bb` (Barretenberg) | `0.87.0` | same — never bump silently |
| Noir `poseidon` lib | tag `v0.2.0` | Poseidon2 params must match on-chain byte-for-byte |
| `soroban-sdk` | `26.0.1`, wasm target `wasm32v1-none` | build with `stellar contract build` |
| `stellar` CLI | `27.0.0` | |
| Rust | `1.91.0` (build), but `stellar contract build` needs `1.92.0` (`RUSTUP_TOOLCHAIN=1.92.0`) | |
| node `20.19.2`, pnpm `10.11.0` | |

See `TOOLCHAIN.md` and `SHARED.md §1`.

## SHARED.md is the source of truth

`SHARED.md` documents the **cross-component invariants** that the Noir circuits, Soroban contracts,
and TS SDK must agree on byte-for-byte. A mismatch makes deposits unspendable or proofs
unverifiable. **Read the relevant section before touching any commitment/proof/encoding logic.** Key
invariants:

- **Poseidon2**: BN254, `t=4`, RATE 3, HADES, S-box x^5, IV = `message_size << 64`, output =
  `state[0]`. The SDK's JS impl (`@zkpassport/poseidon2`) is gated by a **mandatory golden-vector
  test** (`sdk/test/poseidon.golden.json`, run `pnpm --filter @lax-stell/sdk golden` to regenerate from
  Noir) — do not proceed past a failing golden test.
- **Commitments**: balance note `commitment = hash4(asset_id, amount, owner_key, blinding)`;
  `nullifier = hash2(commitment, spending_key)`; order `commitment = hash7(...)` — field orders fixed
  everywhere (SHARED §4).
- **Address→field**: `be(raw32(addr)) mod r` — pinned by a cross-impl golden test between SDK and
  contract. Native XLM `asset_id` is the special constant `0`.
- **Merkle**: depth 20, append-only, `hash2` nodes, contract keeps a 100-root history ring buffer.
- **Public-input ordering** per circuit (SHARED §7) — the contract parses `public_inputs` in the
  exact declared `pub`-param order of each circuit's `main`. The 16 pairing-point-object elements
  live inside the proof, so `len(public_inputs) == 32 * (vk.public_inputs_size − 16)`.
- **Verifier API**: `verify_proof(public_inputs, proof_bytes)` — public inputs **first**. Proof is
  exactly 14,592 bytes; VK 1,760 bytes.

## Repository layout

```
circuits/noir/       5 Noir circuits: withdraw, transfer, place_order, match_orders, cancel_order
                     + lax_stell_lib (shared). build_all.sh builds/tests/proves all five.
circuits/artifacts/  Committed vk + sample proof/public_inputs per circuit (verifier deploy inputs).
contracts/           Soroban (Rust) workspace: lax-stell-pool (the app contract), lax-stell-bridge,
                     bridge-mpt (Merkle-Patricia storage proofs), eth-light-client (Eth sync-committee
                     BLS verification), faucet-token (mock SACs for testnet).
sdk/                 @lax-stell/sdk — TS client: notes, orders, Poseidon2, Merkle tree, UltraHonk proofs
                     (@aztec/bb.js), Soroban tx building. Frontend & matcher import from dist/.
matcher/             @lax-stell/matcher — off-chain price-time order matching mirroring match_orders,
                     proof assembly, Soroban submission.
bridge/l1/           Foundry (Solidity) LaxStellBridgeL1 on Ethereum Sepolia.
bridge/relayer/      @lax-stell/relayer — UNTRUSTED transport feeding Eth data to Soroban (every value
                     re-verified on-chain). Beacon finality → EthLightClient; eth_getProof → bridge_in.
frontend/            React + Vite app (Bridge / Portfolio / Pay / Swap), react-three/fiber visuals.
scripts/             deploy.sh (5 verifiers + pool to testnet), e2e.sh (deposit→withdraw round-trip).
vendor/              rs-soroban-ultrahonk, noir-poseidon reference repos — gitignored, cloned locally.
deployments.json     Live testnet contract IDs. The frontend targets `laxStellPoolMatchMemo`.
```

pnpm workspaces: `sdk`, `matcher`, `frontend`, `bridge/relayer`. `SPEC.md` = full design;
`BRIDGE_SPEC.md` / `BRIDGE_DEPLOYMENT.md` = cross-chain bridge; `DEPLOYMENT.md` = every live tx.

## Common commands

Use the `justfile` for the frontend/SDK dev loop:

```bash
just setup        # pnpm install + build SDK (first-run)
just dev          # build SDK, then Vite dev server at http://localhost:5173
just build        # production frontend build (tsc --noEmit + vite build)
just typecheck    # frontend typecheck
just relayer <args>       # build + run the relayer CLI (e.g. just relayer watch)
just relayer-test
```

Workspace-wide (from root): `pnpm -r build`, `pnpm -r test`, `pnpm -r lint`.

**SDK / matcher / relayer** (Vitest + tsup):
```bash
pnpm --filter @lax-stell/sdk build           # tsup → dist/ (build SDK before frontend/matcher)
pnpm --filter @lax-stell/sdk test            # vitest run
pnpm --filter @lax-stell/sdk test -- note    # single test file (matcher/relayer same pattern)
pnpm --filter @lax-stell/sdk golden          # regenerate Poseidon2 golden vectors from Noir
```

**Circuits** (must `source ./env.sh` first):
```bash
cd circuits/noir/withdraw && nargo test   # in-circuit unit tests for one circuit
circuits/noir/build_all.sh                # test + compile + prove + write_vk all 5, asserts proof/vk sizes
```

**Contracts** (Rust/Soroban):
```bash
cd contracts && cargo test                        # unit + cross-impl golden tests (test.rs)
cd contracts && RUSTUP_TOOLCHAIN=1.92.0 stellar contract build   # wasm32v1-none
```

**L1 bridge** (Foundry, in `bridge/l1/`): `forge test`, `forge build`. Uses a `forge-std` git submodule.

**Deploy / e2e** (testnet, needs `source ./env.sh` + funded identity):
```bash
scripts/deploy.sh    # deploys 5 verifiers (one per circuit VK) + the pool wired to them
scripts/e2e.sh       # live deposit 1 XLM → withdraw with a real ZK proof, reads deployments.json
```

## Architecture notes

- **One verifier contract per circuit VK.** `scripts/deploy.sh` deploys 5 UltraHonk verifier
  instances (VK immutable after construction) and constructs `lax-stell-pool` with their addresses. The
  pool parses each circuit's public inputs, checks state (root ∈ history, nullifier unspent, order
  active), then cross-calls the matching verifier. Without a valid proof, no funds move.
- **`deposit` has no proof** — the note's `asset_id` is committed off-chain inside the opaque
  commitment. Every state transition *out* of the shielded layer does require a proof, and `withdraw`
  additionally binds public `asset_id`/`recipient_hash` to the SAC transfer args (else a proof for
  one asset could draw another).
- **Proof generation is UltraHonk with a keccak transcript** (`--oracle_hash keccak`) — the verifier
  does not support the Poseidon2 transcript. The browser uses `@aztec/bb.js` `UltraHonkBackend` with
  the matching keccak option.
- **The relayer holds no authority.** It transports Ethereum beacon finality updates and storage
  proofs to Soroban, where the BLS signature and MPT proof are re-verified on-chain against a recorded
  Ethereum `state_root`.
- **Pool versions in `deployments.json`**: multiple pool deployments exist (base → memo → match-memo).
  The frontend targets `laxStellPoolMatchMemo`, whose events carry encrypted note payloads + leaf
  indices so notes are self-custodially discoverable and the indexer can rebuild the tree. When
  wiring the frontend/indexer to a contract, use that entry, not `laxStellPool`.

## Status

Hackathon WIP on Stellar **testnet**. Some components are marked MVP/mock in their own READMEs (e.g.
faucet-token mints permissionlessly; the frontend has referenced a mock SDK path). Check the
component README before assuming production behavior.
