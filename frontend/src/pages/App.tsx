import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import * as fcl from '@onflow/fcl'
import { useEffect, useState } from 'react'
import '../fclConfig'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ totalCircles: 0, activeMembers: 0, totalDeposits: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => fcl.currentUser().subscribe(setUser), [])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      await fcl.authenticate()
    } catch (err) {
      console.error('Wallet connection failed:', err)
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  // Mock stats - in real app, fetch from contract
  useEffect(() => {
    setStats({ totalCircles: 12, activeMembers: 48, totalDeposits: 1200 })
  }, [])

  return (
    <div className="min-h-screen relative">
      <Nav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 floating">
              Welcome to <span className="rainbow-text">Micro-Savings Circles</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join trustless savings groups, make regular deposits, and take turns receiving the pooled payout. 
              Built on Flow blockchain for secure, transparent community finance.
            </p>
            
            {!user?.addr ? (
              <div className="mb-12">
                <p className="text-lg text-gray-700 mb-6">Connect your wallet to get started</p>
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="btn-primary text-lg px-8 py-4 glow-effect"
                >
                  {isConnecting ? (
                    <div className="flex items-center">
                      <div className="loading-dots mr-2">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      Connecting...
                    </div>
                  ) : (
                    '🔗 Connect Wallet'
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  to="/create" 
                  className="btn-success text-lg px-8 py-4 floating"
                >
                  🚀 Create Circle
                </Link>
                <Link 
                  to="/join" 
                  className="btn-secondary text-lg px-8 py-4 floating"
                  style={{ animationDelay: '0.5s' }}
                >
                  🔍 Join Circle
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 rainbow-text drop-shadow-lg">Platform Statistics</h2>
            <p className="text-lg text-gray-700 drop-shadow-md">Join thousands of users building wealth together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card text-center p-8 floating">
              <div className="text-5xl font-bold text-primary-400 mb-3 glow-effect">{stats.totalCircles}</div>
              <div className="text-lg text-gray-800 font-semibold">Active Circles</div>
            </div>
            <div className="glass-card text-center p-8 floating" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl font-bold text-success-400 mb-3 glow-effect">{stats.activeMembers}</div>
              <div className="text-lg text-gray-800 font-semibold">Active Members</div>
            </div>
            <div className="glass-card text-center p-8 floating" style={{ animationDelay: '0.6s' }}>
              <div className="text-5xl font-bold text-secondary-400 mb-3 glow-effect">{stats.totalDeposits}</div>
              <div className="text-lg text-gray-800 font-semibold">Total Deposits (FLOW)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 rainbow-text drop-shadow-lg">How It Works</h2>
            <p className="text-lg text-gray-700 drop-shadow-md">Simple, secure, and transparent savings circles</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card text-center p-8 floating">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-effect">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create or Join</h3>
              <p className="text-gray-700 leading-relaxed">Start a new savings circle or join an existing one with your preferred pool size and member count.</p>
            </div>
            
            <div className="glass-card text-center p-8 floating" style={{ animationDelay: '0.3s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-effect">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Regular Deposits</h3>
              <p className="text-gray-700 leading-relaxed">Make scheduled deposits each round. The smart contract tracks who has paid and who hasn't.</p>
            </div>
            
            <div className="glass-card text-center p-8 floating" style={{ animationDelay: '0.6s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-effect">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rotating Payouts</h3>
              <p className="text-gray-700 leading-relaxed">Once all members deposit, one member receives the full pool. The cycle continues until everyone gets paid.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 rainbow-text drop-shadow-lg">Ready to Start Saving?</h2>
            <p className="text-xl text-gray-700 mb-8 drop-shadow-md">Join the future of community finance today</p>
            
            {user?.addr ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/create" 
                  className="btn-success text-lg px-8 py-4 floating"
                >
                  ✨ Create Your Circle
                </Link>
                <Link 
                  to="/join" 
                  className="btn-secondary text-lg px-8 py-4 floating"
                  style={{ animationDelay: '0.3s' }}
                >
                  🔍 Browse Circles
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary text-lg px-8 py-4 glow-effect"
              >
                {isConnecting ? (
                  <div className="flex items-center">
                    <div className="loading-dots mr-2">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    Connecting...
                  </div>
                ) : (
                  '🔗 Connect Wallet to Start'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-50">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <Footer />
    </div>
  )
}

