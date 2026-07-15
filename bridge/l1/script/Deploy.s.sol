// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {LaxStellBridgeL1} from "../src/LaxStellBridgeL1.sol";

/// @notice Deploys LaxStellBridgeL1 to Sepolia.
/// @dev    Secrets are read from the environment — never hardcode keys.
///
///         Required env:
///           PRIVATE_KEY        deployer key (funded Sepolia EOA), e.g. 0xabc...
///           SEPOLIA_RPC_URL    Sepolia execution RPC endpoint
///         Optional env:
///           RELAYER_OR_GOVERNOR  unlock authority; defaults to the deployer EOA.
///
///         Run (see bridge/l1/README.md):
///           forge script script/Deploy.s.sol:Deploy \
///             --rpc-url "$SEPOLIA_RPC_URL" --broadcast --verify -vvvv
contract Deploy is Script {
    function run() external returns (LaxStellBridgeL1 bridge) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        // Default the unlock authority to the deployer unless overridden.
        address governor = vm.envOr("RELAYER_OR_GOVERNOR", deployer);

        vm.startBroadcast(pk);
        bridge = new LaxStellBridgeL1(governor);
        vm.stopBroadcast();

        console2.log("LaxStellBridgeL1 deployed at:", address(bridge));
        console2.log("relayerOrGovernor:", governor);
        console2.log("locks mapping declaration slot: 0");
    }
}
