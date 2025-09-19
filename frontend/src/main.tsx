import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './pages/App'
import CreateCircle from './pages/CreateCircle'
import JoinCircle from './pages/JoinCircle'
import Deposit from './pages/Deposit'
import Dashboard from './pages/Dashboard'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/create', element: <CreateCircle /> },
  { path: '/join', element: <JoinCircle /> },
  { path: '/deposit/:id', element: <Deposit /> },
  { path: '/circle/:id', element: <Dashboard /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

