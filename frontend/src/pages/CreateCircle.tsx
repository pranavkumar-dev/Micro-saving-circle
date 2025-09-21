import Nav from '../components/Nav'
import Footer from '../components/Footer'
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
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const submit = async () => {
    if (!poolSize || parseFloat(poolSize) <= 0) {
      alert('Please enter a valid pool size')
      return
    }
    
    setIsLoading(true)
    try {
      const tx = await fcl.mutate({ 
        cadence: TX, 
        args: (arg, t) => [arg(poolSize, t.UFix64), arg(String(members), t.UInt8)] 
      })
      setTxId(tx as string)
      await fcl.tx(tx).onceSealed()
      setIsSuccess(true)
    } catch (error) {
      console.error('Transaction failed:', error)
      alert('Transaction failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPoolSize('10.0')
    setMembers(3)
    setTxId(null)
    setIsSuccess(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Nav />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Circle Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your savings circle has been created with a pool size of <strong>{poolSize} FLOW</strong> and capacity for <strong>{members} members</strong>.
            </p>
            {txId && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Transaction ID:</p>
                <p className="text-xs text-gray-700 break-all font-mono">{txId}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={resetForm}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Create Another Circle
              </button>
              <a 
                href="/join"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
              >
                Browse Circles
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Nav />
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Circle</h2>
            <p className="text-gray-600">Set up your savings circle parameters and invite members to join</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pool Size (FLOW Tokens)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={poolSize} 
                  onChange={e => setPoolSize(e.target.value)} 
                  className="form-input text-lg pl-8" 
                  placeholder="10.0"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">💎</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Each member will deposit this amount per round</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Members
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={members} 
                  min={3} 
                  max={10} 
                  onChange={e => setMembers(parseInt(e.target.value) || 3)} 
                  className="form-input text-lg pl-8" 
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">👥</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Number of members who can join this circle (3-10)</p>
            </div>

            {/* Circle Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Circle Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Pool Size:</span>
                  <span className="ml-2 font-semibold">{poolSize} FLOW</span>
                </div>
                <div>
                  <span className="text-gray-600">Members:</span>
                  <span className="ml-2 font-semibold">{members}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Pool:</span>
                  <span className="ml-2 font-semibold">{(parseFloat(poolSize) * members).toFixed(1)} FLOW</span>
                </div>
                <div>
                  <span className="text-gray-600">Rounds:</span>
                  <span className="ml-2 font-semibold">{members}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={submit} 
              disabled={isLoading || !poolSize || parseFloat(poolSize) <= 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Circle...
                </div>
              ) : (
                '🚀 Create Circle'
              )}
            </button>

            {txId && (
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Transaction ID:</p>
                <p className="text-xs text-gray-700 break-all font-mono">{txId}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

