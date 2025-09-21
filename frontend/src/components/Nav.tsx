import { Link, useLocation } from 'react-router-dom'
import * as fcl from '@onflow/fcl'
import { useEffect, useState } from 'react'
import '../fclConfig'

export default function Nav() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  
  useEffect(() => fcl.currentUser().subscribe(setUser), [])

  const isActive = (path: string) => location.pathname === path

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

  const handleDisconnect = async () => {
    try {
      await fcl.unauthenticate()
      setError(null)
    } catch (err) {
      console.error('Wallet disconnection failed:', err)
    }
  }

  return (
    <nav className="w-full bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 shadow-xl border-b-2 border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center glow-effect border border-white/30">
                <span className="text-white font-bold text-lg">💸</span>
              </div>
              <span className="text-white font-bold text-xl rainbow-text">Micro-Savings Circles</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/10'
                }`}
              >
                🏠 Home
              </Link>
              <Link 
                to="/create" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/create') 
                    ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/10'
                }`}
              >
                🚀 Create
              </Link>
              <Link 
                to="/join" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/join') 
                    ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/10'
                }`}
              >
                🔍 Join
              </Link>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            {user?.addr ? (
              <div className="flex items-center space-x-3">
                <div className="text-white text-sm">
                  <span className="text-white/70">Connected:</span>
                  <span className="ml-1 font-mono text-yellow-300 bg-white/10 px-2 py-1 rounded">{user.addr.slice(0,6)}...{user.addr.slice(-4)}</span>
                </div>
                <button 
                  onClick={handleDisconnect} 
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white bg-opacity-10 rounded-lg mt-2">
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-white bg-opacity-20 text-white' : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/create" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/create') ? 'bg-white bg-opacity-20 text-white' : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Create Circle
              </Link>
              <Link 
                to="/join" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/join') ? 'bg-white bg-opacity-20 text-white' : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Join Circle
              </Link>
              <div className="pt-2">
                {user?.addr ? (
                  <div className="px-3 py-2">
                    <div className="text-blue-100 text-sm mb-2">
                      Connected: {user.addr.slice(0,6)}...{user.addr.slice(-4)}
                    </div>
                    <button 
                      onClick={() => {
                        handleDisconnect()
                        setIsMenuOpen(false)
                      }} 
                      className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      handleConnect()
                      setIsMenuOpen(false)
                    }}
                    disabled={isConnecting}
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium mx-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mb-2">
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
    </nav>
  )
}

