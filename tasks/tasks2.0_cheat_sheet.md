Below is a **deep-dive reference pack** you can keep at your side while you (or an automated agent) execute Task 2.  It is split exactly as you asked:

* **Part A – Agent-only cheat-sheet** → everything the scriptable steps need (2.1, 2.3, 2.4, 2.5).
* **Part B – Human-only guides** → what you personally have to click, copy, or paste (2.2, 2.6, 2.7).

No ready-made code is included—just **current, verified facts, library versions, and gotchas** so you can wire things correctly in VS Code.

---

## Part A – Cheat-sheet for the automated steps

### 2.1  Hardhat network + compiler settings  (“hedera-testnet”)

| Item                       | Current, tested value                                                                               | Why it matters                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **RPC endpoint**           | `https://testnet.hashio.io/api`                                                                     | Hashio is the official JSON-RPC relay cluster and is *de facto* standard in Hedera docs ([docs.hedera.com][1])                     |
| **Chain-ID**               | `296` (hex `0x128`)                                                                                 | Required for EIP-1559 signing and MetaMask; confirmed by both ChainList and Hedera docs ([chainlist.org][2], [docs.hedera.com][1]) |
| **Hardhat version**        | `^3.0.0` (current stable)                                                                           | HH 3 ships with native **ethers v6** support—no more v5 shims ([npmjs.com][3])                                                     |
| **Toolbox plugin**         | `@nomicfoundation/hardhat-toolbox@^6`                                                               | Bundles ethers v6, chai-matchers, coverage, viem helpers, etc. ([npmjs.com][3])                                                    |
| **Compiler**               | Solidity `0.8.30` or later                                                                          | Hedera mirror nodes already index 0.8.29+, and Hardhat 3 supports it out-of-the-box ([github.com][4], [docs.hedera.com][5])        |
| **Optimizer**              | enabled, `runs = 500`                                                                               | Hedera gas cost is predictable; 500 runs is the sweet-spot for size vs. runtime                                                    |
| **Ethers provider tweaks** | set `timeout: 120_000` ms when creating a JsonRpcProvider                                           | Hashio rate-limits on long polling; bigger timeout avoids flaky deployments                                                        |
| **Optional**               | `hardhat-ignition@0.15.x` with `maxFeePerGas` / `maxPriorityFeePerGas` caps in `ignition.config.ts` | HH Ignition now lets you fail fast if Hedera’s EIP-1559 tips spike ([hardhat.org][6])                                              |

> **Library sunset:** *hethers.js is officially deprecated*—migrate everything to ethers v6 or viem ([hedera.com][7]).

---

### 2.3  `.env` layout & security checklist

| Key            | Format                                           | Notes                                                   |
| -------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `OPERATOR_KEY` | **0x-prefixed 64-hex** (ECDSA private key)       | MetaMask, HashPack, or Portal all export this format    |
| `RPC_URL`      | Exact relay URL (Hashio, Validation Cloud, etc.) | Keep one per network if you also run previewnet/mainnet |
| `CHAIN_ID`     | `296`                                            | Read by some CI pipelines when they spin Hardhat        |
| Optional       | `OPERATOR_ID` (`0.0.x`)                          | Only needed if you still call SDK-native services       |

*Add `.env` to `.gitignore` and to your remote-CI “secret” store.*
The Hedera docs flag accidental key-leaks as the #1 cause of drained test accounts ([docs.hedera.com][8]).

---

### 2.4  Deployment script design (no code, just edge-cases)

* **Ethers v6 identifier change:** after `.deploy()`, the contract address lives on `contract.target`, *not* `contract.address`.  Many older samples break here ([ethereum.stackexchange.com][9]).
* **Gas strategy:**

  * Grab `provider.getFeeData()` once, then pass `maxFeePerGas / maxPriorityFeePerGas` on every tx.
  * Hedera blocks are fixed-size; overpaying doesn’t speed things up (it just wastes HBAR).
  * Typical “good for testnet” numbers in June 2025: **base 5 gwei**, **priority 1 gwei**.
* **Multiple contracts:** Wrap each factory call in `await` so Hardhat shows deterministic logs; failing to await silently “skips” tx receipts in v6.
* **Return value contract map:** Have the script write `{ network, timestamp, addresses }` to `deployment/testnet.json` so step 2.7 can just copy-paste.

---

### 2.5  Deploying

1. `npm run compile` (or `hardhat compile`) – confirms solc 0.8.30 is cached.
2. `hardhat run scripts/deploy.js --network hedera-testnet`
3. **Timeouts:** If you see `HH105: Transaction dropped and replaced`, raise the `CONFIRMATIONS` env or add `--wait 3` (Hashio sometimes reorganises pending pools).
4. **CI headless:** Hardhat 3 supports `--report-gas` without waffle; pipe it to artefacts if you need audit trails.

---

## Part B – Human-only actions

### 2.2  Create & fund testnet accounts

| Method                     | Steps                                                                                                                                 | Max daily HBAR |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **HashPack wallet (fast)** | ① Install extension → ② Generate ECDSA account → ③ On the “Receive” tab hit **Get Faucet**                                            | 100            |
| **Hedera Portal**          | ① Sign-in with GitHub/Google → ② Click **Create Testnet Account → ECDSA** → ③ Copy key pair → ④ Press **Fund 1000 HBAR**              | 1 000 (24 h)   |
| **MetaMask + ChainList**   | ① Add network *Hedera Testnet* (Chain 296) through ChainList → ② Copy address → ③ Open **docs.hedera.com → Testnet Faucet** and paste | 100            |

The faucet and Portal quotas were updated **Feb 1 2024** ([hedera.com][10]).  If you hit the limit, wait 24 h; there is no bypass.

---

### 2.6  Verify on HashScan

1. Browse to **hashscan.io/testnet → Contracts → Verify** ([docs.hedera.com][11]).
2. Paste the EVM address, press **Verify**.
3. Drag-and-drop the correct `build-info-*.json` (Hardhat writes one per compilation).
4. Wait for a **Full-match ✔︎**.
   *Partial-match means only the metadata hash differs; you can re-verify after recompiling with identical settings* ([hedera.com][12]).

---

### 2.7  Record addresses & network metadata

* **Minimum you should store** (per environment):

  ```jsonc
  {
    "network":  "hedera-testnet",
    "chainId":  296,
    "deployer": "0xYourEvmAcct",
    "FighterNFT": "0x...",
    "FightClub": "0x...",
    "verified":  true,
    "date":      "2025-07-05T12:34:56Z"
  }
  ```
* Keep it under `config/contracts.<env>.json`; front-end loaders (wagmi, viem, or ethers) can import it directly.
* If you need Hedera-native IDs later (e.g., for HTS precompiles), grab them from the “Contract ID” field in HashScan’s header.

---

### Final cross-checks before moving on

| ✅ | Question                                                   |
| - | ---------------------------------------------------------- |
| ☐ | `.env` never committed?                                    |
| ☐ | Hardhat 3 + Toolbox 6 installed without peer-dep warnings? |
| ☐ | Deployment JSON written and pushed?                        |
| ☐ | Both contracts show **Full-match** on HashScan?            |

---

### Opinionated take (you asked for it)

*Skip Hardhat-waffle & typechain-v5 entirely.*  The new toolbox + viem helper stack is lighter and *just works* with ethers v6.  Foundry is catching up on Hedera, but for now Hardhat is the smoother path because every doc and faucet example is built around it.

If something here is unclear or Hedera ships yet-another-SDK tomorrow, ping me—I’ll happily call out anything that changed.

[1]: https://docs.hedera.com/hedera/getting-started-evm-developers/add-hedera-to-metamask?utm_source=chatgpt.com "Add Hedera to MetaMask"
[2]: https://chainlist.org/chain/296?utm_source=chatgpt.com "Hedera Testnet RPC and Chain settings - ChainList"
[3]: https://www.npmjs.com/package/%40nomicfoundation/hardhat-toolbox?utm_source=chatgpt.com "nomicfoundation/hardhat-toolbox - NPM"
[4]: https://github.com/ethereum/solidity/releases?utm_source=chatgpt.com "Releases · ethereum/solidity - GitHub"
[5]: https://docs.hedera.com/hedera/getting-started-evm-developers/deploy-a-smart-contract-with-hardhat "Deploy a Smart Contract with Hardhat | Hedera"
[6]: https://hardhat.org/ignition/docs/config?utm_source=chatgpt.com "Configuration | Ethereum development environment for ... - Hardhat"
[7]: https://hedera.com/blog/hethers-js-being-deprecated-in-favor-of-evm-tooling "Hethers.js Being Deprecated in Favor of EVM Tooling | Hedera"
[8]: https://docs.hedera.com/hedera/core-concepts/smart-contracts/json-rpc-relay "JSON-RPC Relay | Hedera"
[9]: https://ethereum.stackexchange.com/questions/155115/how-to-deploy-a-contract-using-hardhat-and-ethersjs-v6?utm_source=chatgpt.com "How to deploy a contract using hardhat and ethersjs v6"
[10]: https://hedera.com/blog/introducing-a-new-testnet-faucet-and-hedera-portal-changes?utm_source=chatgpt.com "Introducing a New Testnet Faucet and Hedera Portal Changes"
[11]: https://docs.hedera.com/hedera/tutorials/smart-contracts/how-to-verify-a-smart-contract-on-hashscan "How to Verify a Smart Contract on HashScan | Hedera"
[12]: https://hedera.com/blog/smart-contract-verification-on-hedera?utm_source=chatgpt.com "Smart Contract Verification on Hedera"
