import { Link } from 'react-router-dom'
import * as fcl from '@onflow/fcl'
import { useEffect, useState } from 'react'
import '../fclConfig'

export default function Nav() {
  const [user, setUser] = useState<any>(null)
  useEffect(() => fcl.currentUser().subscribe(setUser), [])

  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold">Micro-Savings Circles</Link>
          <Link to="/create" className="text-sm text-gray-600 hover:text-black">Create</Link>
          <Link to="/join" className="text-sm text-gray-600 hover:text-black">Join</Link>
        </div>
        <div>
          {user?.addr ? (
            <button onClick={() => fcl.unauthenticate()} className="px-3 py-1 border rounded">
              {user.addr.slice(0,6)}...{user.addr.slice(-4)}
            </button>
          ) : (
            <button onClick={() => fcl.authenticate()} className="px-3 py-1 border rounded">Connect</button>
          )}
        </div>
      </div>
    </div>
  )
}

