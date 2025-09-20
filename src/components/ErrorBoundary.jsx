import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){ super(props); this.state = { hasError: false }}
  static getDerivedStateFromError(){ return { hasError: true } }
  componentDidCatch(err, info){ console.error('ErrorBoundary', err, info) }
  render(){ if(this.state.hasError) return <div className="p-4 bg-red-100 text-red-700">Something went wrong.</div>; return this.props.children }
}
