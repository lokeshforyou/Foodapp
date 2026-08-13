import React, { useEffect, useState } from 'react';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import { getMenu } from './services/api';

export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('menu'); // 'menu' or 'cart'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  async function fetchMenu() {
    setLoading(true);
    try {
      const items = await getMenu();
      setMenu(items);
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(menuItem, qty = 1) {
    setCart((prev) => {
      const exist = prev.find((p) => p.menuId === menuItem.id);
      if (exist) {
        return prev.map((p) => (p.menuId === menuItem.id ? { ...p, qty: p.qty + qty } : p));
      } else {
        return [...prev, { menuId: menuItem.id, name: menuItem.name, price_cents: menuItem.price_cents, qty }];
      }
    });
  }

  function updateQty(menuId, qty) {
    setCart((prev) => prev.map((p) => (p.menuId === menuId ? { ...p, qty: Math.max(0, qty) } : p)).filter((p) => p.qty > 0));
  }

  function removeFromCart(menuId) {
    setCart((prev) => prev.filter((p) => p.menuId !== menuId));
  }

  function clearCart() {
    setCart([]);
  }

  const totalCents = cart.reduce((s, it) => s + it.price_cents * it.qty, 0);

  return (
    <div className="app">
      <header className="header">
        <h1>Simple Food Order</h1>
        <nav>
          <button onClick={() => setView('menu')} className={view === 'menu' ? 'active' : ''}>Menu</button>
          <button onClick={() => setView('cart')} className={view === 'cart' ? 'active' : ''}>
            Cart ({cart.reduce((s, it) => s + it.qty, 0)})
          </button>
        </nav>
      </header>

      <main>
        {view === 'menu' && <Menu items={menu} loading={loading} onAdd={addToCart} />}
        {view === 'cart' && (
          <Cart
            items={cart}
            totalCents={totalCents}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onOrderPlaced={clearCart}
          />
        )}
      </main>

      <footer className="footer">
        <span>Total: ${(totalCents / 100).toFixed(2)}</span>
      </footer>
    </div>
  );
}
