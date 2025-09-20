import React, { Suspense, lazy } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
const ProductsPage = lazy(()=> import('./pages/ProductsPage'))
const ProductDetail = lazy(()=> import('./pages/ProductDetail'))
const Login = lazy(()=> import('./pages/Login'))
const CartPage = lazy(()=> import('./pages/CartPage'))
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4">
        <ErrorBoundary>
          <Suspense fallback={<div className="loader" /> }>
            <Routes>
              <Route path="/" element={<ProductsPage/>} />
              <Route path="/product/:id" element={<ProductDetail/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/cart" element={<CartPage/>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
