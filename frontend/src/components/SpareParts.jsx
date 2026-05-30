import { useEffect, useState } from 'react';
import axios from 'axios';

function SpareParts() {
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', quantity: 0, unitPrice: 0 });
  const [message, setMessage] = useState('');

  const loadParts = async () => {
    const response = await axios.get('/api/spare-parts');
    setParts(response.data);
  };

  useEffect(() => {
    loadParts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post('/api/spare-parts', form);
    setForm({ name: '', category: '', quantity: 0, unitPrice: 0 });
    setMessage('Spare part added successfully');
    loadParts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/spare-parts/${id}`);
    loadParts();
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add Spare Part</h2>
        {message && <div className="mb-4 text-green-700">{message}</div>}
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price</label>
            <input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} required />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900">
              Save Spare Part
            </button>
          </div>
        </form>
      </section>
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Spare Parts List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Total Price</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{part.id}</td>
                  <td className="px-4 py-3">{part.name}</td>
                  <td className="px-4 py-3">{part.category}</td>
                  <td className="px-4 py-3">{part.quantity}</td>
                  <td className="px-4 py-3">{part.unitPrice}</td>
                  <td className="px-4 py-3">{part.totalPrice}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(part.id)} className="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SpareParts;
