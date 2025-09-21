import Nav from '../components/Nav'
import Footer from '../components/Footer'
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

interface Circle {
  id: number
  poolSize: number
  maxMembers: number
  currentMembers: number
  currentRound: number
  totalRounds: number
  status: 'open' | 'full' | 'in_progress' | 'completed'
}

export default function JoinCircle() {
  const [circles, setCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress'>('all')

  useEffect(() => {
    // Mock data - in real app, fetch from contract
    const mockCircles: Circle[] = [
      { id: 1, poolSize: 5.0, maxMembers: 4, currentMembers: 2, currentRound: 1, totalRounds: 4, status: 'open' },
      { id: 2, poolSize: 10.0, maxMembers: 6, currentMembers: 6, currentRound: 2, totalRounds: 6, status: 'in_progress' },
      { id: 3, poolSize: 15.0, maxMembers: 5, currentMembers: 3, currentRound: 1, totalRounds: 5, status: 'open' },
      { id: 4, poolSize: 8.0, maxMembers: 4, currentMembers: 4, currentRound: 3, totalRounds: 4, status: 'in_progress' },
      { id: 5, poolSize: 20.0, maxMembers: 8, currentMembers: 5, currentRound: 1, totalRounds: 8, status: 'open' },
    ]
    
    setTimeout(() => {
      setCircles(mockCircles)
      setLoading(false)
    }, 1000)
  }, [])

  const join = async (id: number) => {
    setJoining(id)
    try {
      const tx = await fcl.mutate({ 
        cadence: JOIN_TX, 
        args: (arg, t) => [arg(String(id), t.UInt64)] 
      })
      await fcl.tx(tx).onceSealed()
      
      // Update local state
      setCircles(prev => prev.map(circle => 
        circle.id === id 
          ? { ...circle, currentMembers: circle.currentMembers + 1, status: circle.currentMembers + 1 >= circle.maxMembers ? 'full' : 'open' }
          : circle
      ))
      
      alert(`Successfully joined Circle #${id}!`)
    } catch (error) {
      console.error('Join failed:', error)
      alert('Failed to join circle. Please try again.')
    } finally {
      setJoining(null)
    }
  }

  const filteredCircles = circles.filter(circle => {
    if (filter === 'all') return true
    if (filter === 'open') return circle.status === 'open'
    if (filter === 'in_progress') return circle.status === 'in_progress'
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'full': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'full': return 'Full'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Nav />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available circles...</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Nav />
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join a Savings Circle</h2>
          <p className="text-gray-600">Browse available circles and join one that fits your savings goals</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Circles
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === 'open' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === 'in_progress' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress
            </button>
          </div>
        </div>

        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCircles.map(circle => (
            <div key={circle.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Circle #{circle.id}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(circle.status)}`}>
                  {getStatusText(circle.status)}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pool Size:</span>
                  <span className="font-semibold">{circle.poolSize} FLOW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-semibold">{circle.currentMembers}/{circle.maxMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Round:</span>
                  <span className="font-semibold">{circle.currentRound}/{circle.totalRounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pool:</span>
                  <span className="font-semibold">{(circle.poolSize * circle.maxMembers).toFixed(1)} FLOW</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Membership</span>
                  <span>{Math.round((circle.currentMembers / circle.maxMembers) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(circle.currentMembers / circle.maxMembers) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => join(circle.id)}
                disabled={circle.status !== 'open' || joining === circle.id}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  circle.status === 'open' && joining !== circle.id
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {joining === circle.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </div>
                ) : circle.status === 'open' ? (
                  'Join Circle'
                ) : circle.status === 'full' ? (
                  'Circle Full'
                ) : circle.status === 'in_progress' ? (
                  'In Progress'
                ) : (
                  'Not Available'
                )}
              </button>
            </div>
          ))}
        </div>

        {filteredCircles.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Circles Found</h3>
            <p className="text-gray-600 mb-6">No circles match your current filter criteria.</p>
            <button
              onClick={() => setFilter('all')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              View All Circles
            </button>
          </div>
        )}
        </div>
        <Footer />
      </div>
    )
  }

