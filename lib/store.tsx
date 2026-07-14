"use client";
import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export type CartItem = {
  id: string; name: string; variant: string; price: number; qty: number; image: string; variantId?: string;
};
type State = { items: CartItem[]; drawerOpen: boolean };
type Action =
  | { type: "ADD"; item: CartItem }
  | { type: "INC"; id: string }
  | { type: "DEC"; id: string }
  | { type: "REMOVE"; id: string }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "HYDRATE"; items: CartItem[] };

const STORAGE_KEY = "sb-cart-items";

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "ADD": {
      const ex = s.items.find(i => i.id === a.item.id);
      return { drawerOpen: true, items: ex ? s.items.map(i => i.id === a.item.id ? { ...i, qty: i.qty + a.item.qty } : i) : [...s.items, a.item] };
    }
    case "INC": return { ...s, items: s.items.map(i => i.id === a.id ? { ...i, qty: i.qty + 1 } : i) };
    case "DEC": return { ...s, items: s.items.map(i => i.id === a.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i) };
    case "REMOVE": return { ...s, items: s.items.filter(i => i.id !== a.id) };
    case "OPEN": return { ...s, drawerOpen: true };
    case "CLOSE": return { ...s, drawerOpen: false };
    case "HYDRATE": return { ...s, items: a.items };
    default: return s;
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], drawerOpen: false });

  // Rehydrate the cart from localStorage after mount (client-only — reading
  // localStorage during the initial render would break server rendering).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const items = JSON.parse(raw) as CartItem[];
      if (Array.isArray(items) && items.length > 0) dispatch({ type: "HYDRATE", items });
    } catch {
      // Corrupt or inaccessible storage — start with an empty cart.
    }
  }, []);

  // Persist on every change so a refresh (or closed tab) doesn't lose the cart.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Storage full or unavailable (e.g. private browsing) — fail silently.
    }
  }, [state.items]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx)!;
  const subtotal = c.state.items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = c.state.items.reduce((s, i) => s + i.qty, 0);
  return { ...c.state, dispatch: c.dispatch, subtotal, count };
}
