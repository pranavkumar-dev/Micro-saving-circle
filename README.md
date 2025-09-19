## Micro-Savings Circles — Community ROSCA Dapp Built on Flow 💸

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

