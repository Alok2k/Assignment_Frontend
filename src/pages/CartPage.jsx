import React, { useEffect, useState, useCallback } from 'react';
import { getLocalCart, removeFromLocalCart, clearLocalCart } from '../utils/cartLocal';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null'); // optional usage





  const load = useCallback(() => {
    setLoading(true);
    try {
      const cart = getLocalCart();
      setItems(cart);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('cartUpdated', handler);
    // also listen to storage events (in case multiple tabs change)
    const storageHandler = (ev) => {
      if (ev.key === 'cart_local') load();
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('cartUpdated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [load]);

  const remove = async (productId) => {
    try {
      const updated = removeFromLocalCart(productId);
      setItems(updated);
    } catch (e) {
      console.error('remove error', e);
    }
  };

  const checkout = async () => {
  
    if (!items || items.length === 0) {
      alert('Cart is empty');
      return;
    }

    
    if (!user) { alert('Please login'); return; }

    try {
      
      clearLocalCart();
      setItems([]);
      alert('Order placed (local demo)');
    } catch (e) {
      console.error('checkout error', e);
      alert('Checkout failed');
    }
  };

  if (loading) return <div className="loader" />;



  const total = items.reduce((s, it) => s + (Number(it.price || 0) * (it.qty || 0)), 0);

  return (
    <div className="max-w-3xl mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold">Cart</h2>
      {items.length === 0 ? (
        <div className="py-6 text-center text-gray-600">Your cart is empty</div>
      ) : (
        <>
          <ul>
            {items.map(it => (
              <li key={it.productId} className="flex items-center gap-4 py-2 border-b">
                <img src={it.image || 'https://placehold.co/80x80'} alt={it.name} className="w-16 h-16 object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{it.name || 'Product'}</div>
                  <div className="text-sm text-gray-500">Rs {it.price}</div>
                </div>
                <div>Qty: {it.qty}</div>
                <div className="font-semibold">Rs {Number(it.price || 0) * (it.qty || 0)}</div>
                <button className="text-red-600 ml-4" onClick={() => remove(it.productId)}>Remove</button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Total: Rs {total}</div>
            <div>
              <button onClick={checkout} className="bg-green-600 text-white px-4 py-2 rounded">Place Order</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
