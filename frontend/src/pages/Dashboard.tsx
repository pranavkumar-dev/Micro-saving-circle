import Nav from '../components/Nav'
import * as fcl from '@onflow/fcl'
import '../fclConfig'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

const STATUS_SCRIPT = `
import MicroSavingsCircles from 0xMicroSavingsCircles

pub fun main(circleId: UInt64): MicroSavingsCircles.CircleView {
  return MicroSavingsCircles.checkStatus(circleId: circleId)
}
`

const PAYOUT_TX = `
import MicroSavingsCircles from 0xMicroSavingsCircles

transaction(circleId: UInt64) {
  prepare(acct: AuthAccount) {}
  execute {
    MicroSavingsCircles.payout(circleId: circleId)
  }
}
`

export default function Dashboard() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  const load = async () => {
    const res: any = await fcl.query({ cadence: STATUS_SCRIPT, args: (arg, t) => [arg(String(id), t.UInt64)] })
    setData(res)
  }

  useEffect(() => { load() }, [id])

  const payout = async () => {
    const tx = await fcl.mutate({ cadence: PAYOUT_TX, args: (arg, t) => [arg(String(id), t.UInt64)], limit: 200 })
    await fcl.tx(tx).onceSealed()
    await load()
  }

  if (!data) return (
    <div>
      <Nav />
      <div className="max-w-3xl mx-auto p-6">Loading...</div>
    </div>
  )

  return (
    <div>
      <Nav />
      <div className="max-w-3xl mx-auto p-6">
        <div className="border rounded p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Circle #{data.circleId}</h2>
            <button onClick={payout} className="px-3 py-1 bg-black text-white rounded">Trigger Payout</button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">Pool size</div>
              <div className="text-lg">{data.poolSize}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current round</div>
              <div className="text-lg">{data.currentRound} / {data.totalRounds}</div>
            </div>
          </div>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Members</div>
            <ul className="list-disc pl-6">
              {(data.members || []).map((a: string, i: number) => (
                <li key={i} className="text-sm">{a}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Deposited this round</div>
            <ul className="list-disc pl-6">
              {(data.members || []).map((a: string, i: number) => (
                <li key={i} className="text-sm">{a} — {data.currentRoundDeposited[a] ? 'Yes' : 'No'}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Payout history</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-1">Round</th>
                  <th className="py-1">Winner</th>
                </tr>
              </thead>
              <tbody>
                {(data.payoutHistory || []).map((a: string | null, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="py-1">{i+1}</td>
                    <td className="py-1">{a ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

