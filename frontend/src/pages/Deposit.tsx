import Nav from '../components/Nav'
import * as fcl from '@onflow/fcl'
import '../fclConfig'
import { useParams } from 'react-router-dom'
import { useState } from 'react'

const DEPOSIT_TX = `
import MicroSavingsCircles from 0xMicroSavingsCircles
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

transaction(circleId: UInt64, amount: UFix64) {
  prepare(acct: AuthAccount) {
    let vaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
      ?? panic("No FlowToken vault in storage")
    let sent <- vaultRef.withdraw(amount: amount)
    MicroSavingsCircles.deposit(circleId: circleId, from: <-sent, depositor: acct.address)
  }
}
`

export default function Deposit() {
  const { id } = useParams()
  const [amount, setAmount] = useState('10.0')

  const submit = async () => {
    const tx = await fcl.mutate({ cadence: DEPOSIT_TX, args: (arg, t) => [arg(String(id), t.UInt64), arg(amount, t.UFix64)], limit: 200 })
    await fcl.tx(tx).onceSealed()
    alert('Deposited!')
  }

  return (
    <div>
      <Nav />
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Deposit to Circle #{id}</h2>
        <div className="space-y-3">
          <input value={amount} onChange={e=>setAmount(e.target.value)} className="border rounded px-3 py-2 w-full" />
          <button onClick={submit} className="px-4 py-2 bg-black text-white rounded">Deposit</button>
        </div>
      </div>
    </div>
  )
}

