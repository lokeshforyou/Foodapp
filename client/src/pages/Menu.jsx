import React from 'react';
import MenuItem from '../components/MenuItem';

export default function Menu({ items, loading, onAdd }) {
  if (loading) return <div className="container">Loading menu...</div>;
  if (!items || items.length === 0) return <div className="container">No menu items found.</div>;

  // Group by category
  const byCategory = items.reduce((acc, it) => {
    (acc[it.category || 'Uncategorized'] = acc[it.category || 'Uncategorized'] || []).push(it);
    return acc;
  }, {});

  return (
    <div className="container">
      {Object.keys(byCategory).map((cat) => (
        <section key={cat}>
          <h2>{cat}</h2>
          <div className="grid">
            {byCategory[cat].map((it) => (
              <MenuItem key={it.id} item={it} onAdd={() => onAdd(it, 1)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
