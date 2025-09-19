import Nav from '../components/Nav'
import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <Nav />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to Micro-Savings Circles</h1>
        <p className="text-gray-600 mb-6">Form trustless savings groups, deposit weekly, and rotate payouts.</p>
        <div className="flex gap-3">
          <Link to="/create" className="px-4 py-2 bg-black text-white rounded">Create Circle</Link>
          <Link to="/join" className="px-4 py-2 border rounded">Join Circle</Link>
        </div>
      </div>
    </div>
  )
}

