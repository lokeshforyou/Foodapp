import React, { useState } from 'react';
import { createOrder } from '../services/api';

export default function Cart({ items, totalCents, onUpdateQty, onRemove, onOrderPlaced }) {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState(null);

  async function placeOrder(e) {
    e.preventDefault();
    if (!customerName) {
      setError('Please enter your name');
      return;
    }
    if (!items || items.length === 0) {
      setError('Cart is empty');
      return;
    }
    setError(null);
    setPlacing(true);
    try {
      const payload = {
        customerName,
        address,
        items: items.map((it) => ({ menuId: it.menuId, qty: it.qty }))
      };
      const res = await createOrder(payload);
      setConfirmation(res);
      onOrderPlaced();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container">
      <h2>Your Cart</h2>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.length > 0 && (
        <table className="cart-table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.menuId}>
                <td>{it.name}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={it.qty}
                    onChange={(e) => onUpdateQty(it.menuId, parseInt(e.target.value || 0, 10))}
                  />
                </td>
                <td>${((it.price_cents * it.qty) / 100).toFixed(2)}</td>
                <td><button onClick={() => onRemove(it.menuId)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="order-box">
        <form onSubmit={placeOrder}>
          <div className="form-row">
            <label>
              Name
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </label>
            <label>
              Address
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
          </div>

          <div className="order-summary">
            <strong>Total:</strong> ${(totalCents / 100).toFixed(2)}
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={placing || items.length === 0}>
            {placing ? 'Placing...' : 'Place Order'}
          </button>
        </form>

        {confirmation && (
          <div className="confirmation">
            <h3>Order placed!</h3>
            <p>Order ID: {confirmation.orderId}</p>
            <p>Placed at: {confirmation.order?.created_at}</p>
          </div>
        )}
      </div>
    </div>
  );
}
