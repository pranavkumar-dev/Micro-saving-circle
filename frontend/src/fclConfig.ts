import * as fcl from '@onflow/fcl'
import { MICRO_SAVINGS_ADDR } from './contractAddrs'

const isEmulator = import.meta.env.VITE_FLOW_NETWORK === 'emulator'

fcl.config()
  .put('app.detail.title', 'Micro-Savings Circles')
  .put('app.detail.icon', 'https://fav.farm/💸')
  .put('flow.network', isEmulator ? 'emulator' : 'testnet')
  .put('discovery.wallet', isEmulator
    ? 'http://localhost:8701/fcl/authn'
    : 'https://fcl-discovery.onflow.org/testnet/authn')
  .put('accessNode.api', isEmulator
    ? 'http://localhost:8888'
    : 'https://rest-testnet.onflow.org')
  .put('0xMicroSavingsCircles', MICRO_SAVINGS_ADDR)
  .put('0xFungibleToken', isEmulator ? '0xee82856bf20e2aa6' : '0x9a0766d93b6608b7')
  .put('0xFlowToken', isEmulator ? '0x0ae53cb6e3f42a79' : '0x7e60df042a9c0868')

export default fcl
