import React from 'react';

export default function MenuItem({ item, onAdd }) {
  return (
    <div className="card menu-item">
      <img src={item.image_url || 'https://via.placeholder.com/160'} alt={item.name} />
      <div className="card-body">
        <h3>{item.name}</h3>
        <p className="desc">{item.description}</p>
        <div className="row">
          <strong>${(item.price_cents / 100).toFixed(2)}</strong>
          <button onClick={onAdd}>Add</button>
        </div>
      </div>
    </div>
  );
}
