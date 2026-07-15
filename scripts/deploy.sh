#!/usr/bin/env bash
# Deploy LaxStell to Stellar testnet: 5 UltraHonk verifiers (one per circuit VK) + the pool.
# Prereqs: `source ./env.sh`; a funded testnet identity (default: lax-stell-deployer).
set -euo pipefail
cd "$(dirname "$0")/.."

IDENT="${IDENT:-lax-stell-deployer}"
NET="${NET:-testnet}"
VERIFIER_WASM="vendor/rs-soroban-ultrahonk/target/wasm32v1-none/release/rs_soroban_ultrahonk.wasm"
POOL_WASM="contracts/target/wasm32v1-none/release/lax_stell_pool.wasm"

stellar keys address "$IDENT" >/dev/null 2>&1 || stellar keys generate "$IDENT" --network "$NET" --fund
stellar keys fund "$IDENT" --network "$NET" || true

echo "==> Building wasms (stellar build needs rust 1.92.0)"
( cd vendor/rs-soroban-ultrahonk && RUSTUP_TOOLCHAIN=1.92.0 stellar contract build )
( cd contracts && RUSTUP_TOOLCHAIN=1.92.0 stellar contract build )

# One verifier per circuit VK. Plain vars (no `declare -A`) so this runs on the
# macOS system bash 3.2 as well as bash 4+.
deploy_vf() {
  stellar contract deploy --wasm "$VERIFIER_WASM" --source "$IDENT" --network "$NET" \
    -- --vk_bytes-file-path "circuits/artifacts/$1/vk" | tail -1
}
echo "==> Deploying verifier: withdraw";     VF_WITHDRAW=$(deploy_vf withdraw);     echo "    $VF_WITHDRAW"
echo "==> Deploying verifier: transfer";     VF_TRANSFER=$(deploy_vf transfer);     echo "    $VF_TRANSFER"
echo "==> Deploying verifier: place_order";  VF_PLACE=$(deploy_vf place_order);     echo "    $VF_PLACE"
echo "==> Deploying verifier: match_orders"; VF_MATCH=$(deploy_vf match_orders);    echo "    $VF_MATCH"
echo "==> Deploying verifier: cancel_order"; VF_CANCEL=$(deploy_vf cancel_order);   echo "    $VF_CANCEL"

# Native-XLM SAC address — the pool maps it to the canonical native asset_id 0
# (SHARED §4) when binding `withdraw`'s `asset` arg to the proof's public `asset_id`.
NATIVE=$(stellar contract id asset --asset native --network "$NET")

echo "==> Deploying lax-stell-pool"
POOL=$(stellar contract deploy --wasm "$POOL_WASM" --source "$IDENT" --network "$NET" -- \
  --transfer_vf  "$VF_TRANSFER" \
  --order_vf     "$VF_PLACE" \
  --match_vf     "$VF_MATCH" \
  --withdraw_vf  "$VF_WITHDRAW" \
  --cancel_vf    "$VF_CANCEL" \
  --native_asset "$NATIVE" | tail -1)
echo "    POOL=$POOL"

# Merge the fresh Lax-Stell contract ids into the existing deployments.json
# (preserving bridge / faucet / e2e / history) rather than clobbering it.
DEPLOYER_ADDR="$(stellar keys address "$IDENT")"
DEPLOY_DATE="$(date +%Y-%m-%d)"

POOL="$POOL" NATIVE="$NATIVE" DEPLOYER_ADDR="$DEPLOYER_ADDR" DEPLOY_DATE="$DEPLOY_DATE" \
VF_WITHDRAW="$VF_WITHDRAW" VF_TRANSFER="$VF_TRANSFER" VF_PLACE="$VF_PLACE" \
VF_MATCH="$VF_MATCH" VF_CANCEL="$VF_CANCEL" \
python3 - "$@" <<'PY'
import json, os, pathlib
p = pathlib.Path("deployments.json")
d = json.loads(p.read_text()) if p.exists() else {}
env = os.environ
d["network"] = env.get("NET", d.get("network", "testnet"))
d["deployer"] = env["DEPLOYER_ADDR"]
d["deployedAt"] = env["DEPLOY_DATE"]
c = d.setdefault("contracts", {})
# Fresh Lax-Stell pool (rebranded redeploy) — this is what the frontend targets.
c["laxStellPoolMatchMemo"] = {
    "note": f"Lax-Stell rebranded redeploy ({env['DEPLOY_DATE']}): pool + 5 verifiers rebuilt "
            "from lax-stell source (LaxStellPool/LaxStellError symbols). Reuses existing faucet SACs.",
    "contract": env["POOL"],
    "deployer": env["DEPLOYER_ADDR"],
}
c["verifiers"] = {
    "withdraw": env["VF_WITHDRAW"], "transfer": env["VF_TRANSFER"],
    "place_order": env["VF_PLACE"], "match_orders": env["VF_MATCH"],
    "cancel_order": env["VF_CANCEL"],
}
c.setdefault("assets", {})["native"] = env["NATIVE"]
p.write_text(json.dumps(d, indent=2) + "\n")
print(f"==> Merged fresh ids into deployments.json (pool={env['POOL']})")
PY
