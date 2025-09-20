import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
// Use local dev proxy path; vite.config.js rewrites /api/products -> /cms/products on the external target
const API_BASE = '/api/products'

export default function ProductDetail(){
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let cancelled=false
    async function fetch(){
      setLoading(true)
      try{
          const resp = await fetch(`${API_BASE}/${id}`)
          if(!resp.ok){ console.error('Product detail fetch failed', resp.status); setItem(null); return }
          const it = await resp.json()
          const priceVal = (it.mrp && (typeof it.mrp === 'object' ? (it.mrp.mrp ?? it.mrp) : it.mrp)) || it.price || 0
          const imageVal = (it.images && (it.images.front || it.images[0])) || it.image || it.imageUrl || ''
          setItem({
            id: it.id || it._id || it.productId,
            name: it.name || it.title || '',
            category: it.main_category || it.category || '',
            price: priceVal,
            image: imageVal,
            description: it.description || it.derived_description || it.longDescription || ''
          })
        }catch(err){ console.error(err) }
      finally{ if(!cancelled) setLoading(false) }
    }
    fetch()
    return ()=> cancelled = true
  },[id])

  if(loading) return <div className="loader" />
  if(!item) return <div>Product not found</div>

  return (
    <div className="max-w-3xl mx-auto bg-white p-4 rounded shadow">
      <div className="flex gap-4">
        <img src={item.image} alt="" className="w-48 h-48 object-cover"/>
        <div>
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="text-lg text-green-700">Rs {item.price}</p>
          <p className="mt-2">{item.description}</p>
          <AddToCartButton item={item} />
        </div>
      </div>
    </div>
  )
}

function AddToCartButton({ item }){
  const user = JSON.parse(localStorage.getItem('user')||'null')
  const add = async ()=>{
    if(!user){ alert('Please login'); return }
    try{
      await fetch('http://localhost:6446/cart/'+user.id, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.id, name: item.name, price: item.price, qty: 1, image: item.image })
      })
      alert('Added')
    }catch(err){ alert('Error adding to cart') }
  }
  return <button onClick={add} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Add to cart</button>
}
