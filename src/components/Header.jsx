// src/components/Header.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";

export default function Header() {
  const { user, setUser, cartArray } = useContext(AppContext);
  const nav = useNavigate();

  const logout = () => {
    setUser(null);
    nav("/");
  };

  return (
    <header className="bg-green-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">BigBasket Mock</Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="hidden md:inline">Products</Link>
        <Link to="/cart" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4"/>
          </svg>
          <span>Cart</span>
          
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Hi, {user.username}</span>
            <button onClick={logout} className="bg-white text-green-700 px-3 py-1 rounded">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="bg-white text-green-700 px-3 py-1 rounded">Login</Link>
        )}
      </div>
    </header>
  );
}
