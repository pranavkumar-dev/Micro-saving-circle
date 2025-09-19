#### Built on Flow

## Micro-Savings Circles — Community ROSCA Dapp Built on Flow 💸

[![Built on Flow](https://img.shields.io/badge/Built%20on-Flow-00EF8B?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTg3LjAzNDYgNDguNDQwNUM4My43MjQ3IDQ1LjEzMTYgNzguMjQzOSA0NS4xMzE2IDc0LjkzNDEgNDguNDQwNUM3MS42MjQyIDUxLjc0OTMgNzEuNjI0MiA1Ny4yMzAxIDc0LjkzNDEgNjAuNTM5Qzc4LjI0MzkgNjMuODQ4OSA4My43MjQ3IDYzLjg0ODkgODcuMDM0NiA2MC41MzlDOC40MzQ2NSA1Ni45MzkxIDguNDM0NjUgNTAuOTc0OSA4Ny4wMzQ2IDQ4LjQ0MDVaTTQ2LjA2NTQgNjcuNTYwOUM0Mi43NTU2IDY0LjI1MSAzNy4yNzQ4IDY0LjI1MSAzMy45NjQ5IDY3LjU2MDlDMzAuNjU1MSA3MC44Njk4IDMwLjY1NTEgNzYuMzUxIDMzLjk2NDkgNzkuNjYwOUMzNy4yNzQ4IDgyLjk3MDcgNDIuNzU1NiA4Mi45NzA3IDQ2LjA2NTQgNzkuNjYwOUM0OS4zNzUzIDc2LjM1MSA0OS4zNzUzIDcwLjg2OTggNDYuMDY1NCA2Ny41NjA5Wk04Ny4wMzQ2IDc5LjY2MDlDNjguOTg1NyA5Ny43MDk4IDM5LjI2NzYgOTcuNzA5OCAyMS4yMTg3IDc5LjY2MDlDMy4xNjk4MSA2MS42MTE5IDMuMTY5ODEgMzEuODkzOSAyMS4yMTg3IDEzLjg0NUMzOS4yNjc2IC00LjIwMzk2IDY4Ljk4NTcgLTQuMjAzOTYgODcuMDM0NiAxMy44NDVDMTA1LjA4MzQgMzEuODkzOSAxMDUuMDgzNCA2MS42MTE5IDg3LjAzNDYgNzkuNjYwOVoiIGZpbGw9IiMwMEVGOEIiLz4KPC9zdmc+)](https://flow.com)

Micro-Savings Circles is a Web3 ROSCA (Rotating Savings and Credit Association) dapp — think community chit funds where a group contributes a fixed amount per round and one member receives the pooled payout each cycle. This project is Built on Flow and uses Flow's Cadence smart contracts and FCL for a smooth wallet and transaction experience.

### Key Features
- Create a savings circle with target pool size and max members
- Join an open circle and commit to periodic deposits
- Deposit Flow Token each round; contract tracks who has paid
- Trigger payout to the scheduled recipient once all deposits are in
- View circle state in a simple React frontend

---

### Tech Stack
- **Flow blockchain (emulator & testnet)** — Built on Flow
- **Cadence smart contract** — `contracts/MicroSavingsCircles.cdc`
- **Frontend** — Vite + React + TypeScript + Tailwind CSS
- **Flow Client Library (@onflow/fcl)** — wallet connection & on-chain calls
- **Backend (optional)** — Node.js scaffold for future APIs

### Flow Components Used
- **@onflow/fcl** — wallet discovery, authentication, scripts/transactions
- **Flow CLI** — emulator, account management, deployments
- **Flow Emulator & Dev Wallet** — local development

> Address aliases are configured at runtime via FCL in `frontend/src/fclConfig.ts`.

---

### Monorepo Structure
```
contracts/
  MicroSavingsCircles.cdc
frontend/
  index.html
  src/
    main.tsx
    fclConfig.ts
    contractAddrs.ts
    components/
      Nav.tsx
    pages/
      App.tsx
      CreateCircle.tsx
      JoinCircle.tsx
      Deposit.tsx
      Dashboard.tsx
backend/
  src/index.js
flow.json
```

---

### Prerequisites
- Node.js 18+
- Flow CLI (macOS): `brew install flow-cli`

### Contract Addresses & Imports
Aliases used by FCL and Cadence imports:
- `0xFungibleToken` — emulator `0xee82856bf20e2aa6`, testnet `0x9a0766d93b6608b7`
- `0xFlowToken` — emulator `0x0ae53cb6e3f42a79`, testnet `0x7e60df042a9c0868`
- `0xMicroSavingsCircles` — your deployed address (frontend reads `VITE_CONTRACT_ADDRESS`)

---

### Local Development (Emulator)
1) Start emulator and dev wallet (two terminals):
```bash
flow emulator start --contracts --verbose
```
```bash
flow dev-wallet
```
2) Deploy contract:
```bash
flow project deploy --network emulator
```
3) Run the frontend:
```bash
cd frontend
npm install
VITE_FLOW_NETWORK=emulator \
VITE_CONTRACT_ADDRESS=0xf8d6e0586b0a20c7 \
npm run dev
```
4) (Optional) Run backend stub:
```bash
cd backend
npm install
npm run dev
```

Open the app at `http://localhost:5173` (Vite) unless otherwise specified.

---

### Flow Testnet
1) Create and fund a testnet account: `https://testnet-faucet.onflow.org`
2) Configure `flow.json` with your testnet account (address and key)
3) Deploy the contract:
```bash
flow project deploy --network testnet
```
4) Run the frontend pointing to testnet:
```bash
cd frontend
npm install
VITE_FLOW_NETWORK=testnet \
VITE_CONTRACT_ADDRESS=0x<your_deployed_address> \
npm run dev
```

FCL automatically switches discovery and access nodes based on `VITE_FLOW_NETWORK` as set in `frontend/src/fclConfig.ts`.

---

### Frontend Pages
- **Home/App** — connect wallet and navigate
- **Create Circle** — define pool size and max members
- **Join Circle** — browse/join open circles
- **Deposit** — make scheduled deposits for the active round
- **Dashboard** — view membership, deposits, and payout status

---

### Demo Flow
1) **Create a Circle**
   - Open Create Circle, set pool size (in FlowToken) and max members
   - Sign the transaction

2) **Join a Circle**
   - From Join Circle, select an open circle and join
   - Membership is recorded on-chain

3) **Deposit for the Round**
   - Each member deposits the fixed amount for the round
   - Contract tracks who has deposited

4) **Payout**
   - Once all members have deposited, trigger payout to the scheduled recipient
   - Next round advances

---

### Environment & Configuration
This app uses Vite env variables consumed by `frontend/src/fclConfig.ts` and `frontend/src/contractAddrs.ts`:
```env
VITE_FLOW_NETWORK=emulator|testnet
VITE_CONTRACT_ADDRESS=0xYourDeployedAddress
```

No additional wallet URLs are required; discovery and access nodes are inferred from `VITE_FLOW_NETWORK`.

---

### Security & Production Notes
- Educational reference; not audited
- Add role-based access control, pausability, and invariant checks
- Implement reentrancy and state-transition guards in Cadence
- Comprehensive tests, code review, and external audit before mainnet

---

### Troubleshooting
- **Cadence import errors (aliases)**: Ensure `VITE_FLOW_NETWORK` is correct and FCL alias puts in `fclConfig.ts` match emulator/testnet.
- **Missing Vault/Receiver**: Accounts need a `FlowToken` Vault and receiver at `/public/flowTokenReceiver`.
- **Tx fails on payout**: Confirm all members have deposited for the active round.
- **Wallet connection (emulator)**: Make sure `flow dev-wallet` is running.

---

### Roadmap
- Persist and query circle lists from on-chain state
- Notifications and scheduled round reminders
- Advanced payout strategies (auction/lottery order)
- USDC or other FT support via `FungibleToken` standard
- Backend APIs for indexing and analytics

---

### License
MIT

---

Built on Flow — empowering community finance with secure, user-friendly Web3 savings.

