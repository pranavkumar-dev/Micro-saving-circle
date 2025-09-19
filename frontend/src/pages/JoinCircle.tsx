import Nav from '../components/Nav'
import * as fcl from '@onflow/fcl'
import '../fclConfig'
import { useEffect, useState } from 'react'

const JOIN_TX = `
import MicroSavingsCircles from 0xMicroSavingsCircles

transaction(circleId: UInt64) {
  prepare(acct: AuthAccount) {}
  execute {
    MicroSavingsCircles.joinCircle(circleId: circleId, member: acct.address)
  }
}
`

export default function JoinCircle() {
  const [circles, setCircles] = useState<number[]>([])

  useEffect(() => {
    // Placeholder: in real app, fetch from backend API
    setCircles([1,2,3])
  }, [])

  const join = async (id: number) => {
    const tx = await fcl.mutate({ cadence: JOIN_TX, args: (arg, t) => [arg(String(id), t.UInt64)] })
    await fcl.tx(tx).onceSealed()
    alert('Joined circle '+id)
  }

  return (
    <div>
      <Nav />
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Join Circle</h2>
        <ul className="space-y-3">
          {circles.map(id => (
            <li key={id} className="p-4 border rounded flex items-center justify-between">
              <div>Circle #{id}</div>
              <button onClick={()=>join(id)} className="px-3 py-1 bg-black text-white rounded">Join</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

