import Nav from '../components/Nav'
import Footer from '../components/Footer'
import * as fcl from '@onflow/fcl'
import '../fclConfig'
import { useState, useEffect } from 'react'

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
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showTips, setShowTips] = useState(false)
  const [inputFocus, setInputFocus] = useState<string | null>(null)
  const [animatePreview, setAnimatePreview] = useState(false)

  // Real-time validation
  useEffect(() => {
    const newErrors: {[key: string]: string} = {}
    
    if (poolSize && parseFloat(poolSize) <= 0) {
      newErrors.poolSize = 'Pool size must be greater than 0'
    } else if (poolSize && parseFloat(poolSize) < 0.1) {
      newErrors.poolSize = 'Minimum pool size is 0.1 FLOW'
    } else if (poolSize && parseFloat(poolSize) > 1000) {
      newErrors.poolSize = 'Maximum pool size is 1000 FLOW'
    }
    
    if (members < 3) {
      newErrors.members = 'Minimum 3 members required'
    } else if (members > 10) {
      newErrors.members = 'Maximum 10 members allowed'
    }
    
    setErrors(newErrors)
  }, [poolSize, members])

  // Animate preview when values change
  useEffect(() => {
    setAnimatePreview(true)
    const timer = setTimeout(() => setAnimatePreview(false), 500)
    return () => clearTimeout(timer)
  }, [poolSize, members])

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'current'
    return 'upcoming'
  }

  const getTips = () => {
    const tips = []
    if (parseFloat(poolSize) < 1) {
      tips.push('💡 Smaller amounts make it easier for members to participate')
    }
    if (members > 7) {
      tips.push('💡 Larger circles take longer to complete but offer more social interaction')
    }
    if (parseFloat(poolSize) * members > 50) {
      tips.push('💡 Consider the total pool size - larger amounts may need more trust')
    }
    return tips
  }

  const submit = async () => {
    if (Object.keys(errors).length > 0) {
      setCurrentStep(1)
      return
    }
    
    setCurrentStep(2)
    setIsLoading(true)
    try {
      const tx = await fcl.mutate({ 
        cadence: TX, 
        args: (arg, t) => [arg(poolSize, t.UFix64), arg(String(members), t.UInt8)] 
      })
      setTxId(tx as string)
      setCurrentStep(3)
      await fcl.tx(tx).onceSealed()
      setCurrentStep(4)
      setIsSuccess(true)
    } catch (error) {
      console.error('Transaction failed:', error)
      setCurrentStep(1)
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
    setCurrentStep(1)
    setErrors({})
    setShowTips(false)
    setInputFocus(null)
    setAnimatePreview(false)
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">Create New Circle</h2>
            <p className="text-gray-600">Set up your savings circle parameters and invite members to join</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: 'Configure', icon: '⚙️' },
                { step: 2, label: 'Submit', icon: '📝' },
                { step: 3, label: 'Process', icon: '⏳' },
                { step: 4, label: 'Complete', icon: '✅' }
              ].map(({ step, label, icon }) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                    ${getStepStatus(step) === 'completed' ? 'bg-green-500 text-white' : 
                      getStepStatus(step) === 'current' ? 'bg-blue-500 text-white animate-pulse' : 
                      'bg-gray-200 text-gray-500'}
                  `}>
                    {getStepStatus(step) === 'completed' ? '✓' : icon}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    getStepStatus(step) === 'current' ? 'text-blue-600' : 
                    getStepStatus(step) === 'completed' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pool Size (FLOW Tokens)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1000"
                    inputMode="decimal"
                    value={poolSize} 
                    onChange={e => setPoolSize(e.target.value)}
                    onFocus={() => setInputFocus('poolSize')}
                    onBlur={() => {
                      setInputFocus(null)
                      if (poolSize && !isNaN(parseFloat(poolSize))) {
                        const normalized = Math.min(1000, Math.max(0.1, parseFloat(poolSize)))
                        setPoolSize(normalized.toFixed(2))
                      }
                    }}
                    aria-invalid={Boolean(errors.poolSize)}
                    aria-describedby="poolSize-hint poolSize-error"
                    className={`
                      form-input text-lg pl-8 transition-all duration-300
                      ${inputFocus === 'poolSize' ? 'ring-4 ring-blue-300 scale-105' : ''}
                      ${errors.poolSize ? 'border-red-500 ring-4 ring-red-200' : ''}
                    `}
                    placeholder="e.g., 10.00"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={`text-lg transition-all duration-300 ${
                      inputFocus === 'poolSize' ? 'scale-125' : ''
                    }`}>💎</span>
                  </div>
                  {errors.poolSize && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-red-500 text-xl">⚠️</span>
                    </div>
                  )}
                </div>
                <p id="poolSize-hint" className="text-sm text-gray-500 mt-1">Each member deposits this per round. Min 0.10, Max 1000.00 FLOW.</p>
                {errors.poolSize && (
                  <p id="poolSize-error" className="text-sm text-red-500 mt-1 animate-pulse">{errors.poolSize}</p>
                )}
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
                    inputMode="numeric"
                    onChange={e => setMembers(parseInt(e.target.value) || 3)}
                    onFocus={() => setInputFocus('members')}
                    onBlur={() => setInputFocus(null)}
                    aria-invalid={Boolean(errors.members)}
                    aria-describedby="members-hint members-error"
                    className={`
                      form-input text-lg pl-8 transition-all duration-300
                      ${inputFocus === 'members' ? 'ring-4 ring-blue-300 scale-105' : ''}
                      ${errors.members ? 'border-red-500 ring-4 ring-red-200' : ''}
                    `}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={`text-lg transition-all duration-300 ${
                      inputFocus === 'members' ? 'scale-125' : ''
                    }`}>👥</span>
                  </div>
                  {errors.members && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-red-500 text-xl">⚠️</span>
                    </div>
                  )}
                </div>
                <p id="members-hint" className="text-sm text-gray-500 mt-1">Number of members who can join this circle (3–10).</p>
                {errors.members && (
                  <p id="members-error" className="text-sm text-red-500 mt-1 animate-pulse">{errors.members}</p>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">💡 Smart Tips</h4>
                  <button 
                    onClick={() => setShowTips(!showTips)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {showTips ? 'Hide' : 'Show'} Tips
                  </button>
                </div>
                {showTips && (
                  <div className="space-y-2 animate-fadeIn">
                    {getTips().map((tip, index) => (
                      <p key={index} className="text-sm text-gray-700">{tip}</p>
                    ))}
                    {getTips().length === 0 && (
                      <p className="text-sm text-gray-600">Your configuration looks great! 🎉</p>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={submit} 
                disabled={isLoading || Object.keys(errors).length > 0}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {currentStep === 2 ? 'Submitting...' : 
                     currentStep === 3 ? 'Processing...' : 'Creating Circle...'}
                  </div>
                ) : (
                  '🚀 Create Circle Now'
                )}
              </button>

              {txId && (
                <div className="bg-gray-100 rounded-lg p-4 animate-fadeIn">
                  <p className="text-sm text-gray-500 mb-1">Transaction ID:</p>
                  <p className="text-xs text-gray-700 break-all font-mono">{txId}</p>
                </div>
              )}
            </div>

            {/* Interactive Preview Section */}
            <div className="space-y-6">
              <div className={`
                bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 transition-all duration-500
                ${animatePreview ? 'scale-105 shadow-xl' : ''}
              `}>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🔮</span>
                  Circle Preview
                  {animatePreview && <span className="ml-2 text-lg animate-bounce">✨</span>}
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pool Size:</span>
                      <span className="font-bold text-lg text-blue-600">{poolSize} FLOW</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-bold text-lg text-green-600">{members}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Pool:</span>
                      <span className="font-bold text-lg text-purple-600">{(parseFloat(poolSize) * members).toFixed(1)} FLOW</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rounds:</span>
                      <span className="font-bold text-lg text-orange-600">{members}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Circle Representation */}
                <div className="mt-6 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 border-4 border-blue-300 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{members}</div>
                        <div className="text-xs text-gray-600">members</div>
                      </div>
                    </div>
                    {/* Animated dots around the circle */}
                    {Array.from({ length: members }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-4 h-4 bg-green-400 rounded-full animate-pulse"
                        style={{
                          top: `${50 + 45 * Math.cos((2 * Math.PI * i) / members)}%`,
                          left: `${50 + 45 * Math.sin((2 * Math.PI * i) / members)}%`,
                          transform: 'translate(-50%, -50%)',
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Preview */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-4">📅 Timeline Preview</h4>
                <div className="space-y-3">
                  {Array.from({ length: members }, (_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Round {i + 1}</div>
                        <div className="text-xs text-gray-600">Member {i + 1} receives {poolSize} FLOW</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

