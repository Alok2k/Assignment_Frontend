// src/context/AppContext.jsx
import React, { createContext, useReducer, useEffect, useMemo } from "react";

const AppContext = createContext(null);

const initialState = {
  user: null,
  cartArray: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_CART":
      return { ...state, cartArray: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // load user from localStorage on mount
    const raw = localStorage.getItem("user");
    if (raw) dispatch({ type: "SET_USER", payload: JSON.parse(raw) });
  }, []);

  const setUser = (userObj) => {
    if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
    else localStorage.removeItem("user");
    dispatch({ type: "SET_USER", payload: userObj });
  };

  const value = useMemo(
    () => ({
      user: state.user,
      setUser,
      cartArray: state.cartArray,
      setCart: (arr) => dispatch({ type: "SET_CART", payload: arr }),
    }),
    [state.user, state.cartArray]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
