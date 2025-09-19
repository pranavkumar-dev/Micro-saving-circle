import Nav from '../components/Nav'
import * as fcl from '@onflow/fcl'
import '../fclConfig'
import { useState } from 'react'

const TX = `
import MicroSavingsCircles from 0xMicroSavingsCircles

transaction(poolSize: UFix64, maxMembers: UInt8) {
  prepare(acct: AuthAccount) {}
  execute {
    MicroSavingsCircles.createCircle(poolSize: poolSize, maxMembers: maxMembers)
  }
}
`

export default function CreateCircle() {
  const [poolSize, setPoolSize] = useState('10.0')
  const [members, setMembers] = useState(3)
  const [txId, setTxId] = useState<string | null>(null)

  const submit = async () => {
    const tx = await fcl.mutate({ cadence: TX, args: (arg, t) => [arg(poolSize, t.UFix64), arg(String(members), t.UInt8)] })
    setTxId(tx as string)
    await fcl.tx(tx).onceSealed()
    alert('Circle created!')
  }

  return (
    <div>
      <Nav />
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Create Circle</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm">Pool Size (FlowToken)</label>
            <input value={poolSize} onChange={e=>setPoolSize(e.target.value)} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm">Members (3-10)</label>
            <input type="number" value={members} min={3} max={10} onChange={e=>setMembers(parseInt(e.target.value))} className="border rounded px-3 py-2 w-full" />
          </div>
          <button onClick={submit} className="px-4 py-2 bg-black text-white rounded">Create</button>
          {txId && <p className="text-xs text-gray-500 break-all">Tx: {txId}</p>}
        </div>
      </div>
    </div>
  )
}

