import { useEffect, useState } from 'react';
import axios from 'axios';

function StockOut() {
  const [parts, setParts] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ sparePartId: '', stockOutQuantity: 0, stockOutUnitPrice: 0, stockOutDate: '' });
  const [editing, setEditing] = useState(null);

  const loadParts = async () => {
    const response = await axios.get('/api/spare-parts');
    setParts(response.data);
  };

  const loadRecords = async () => {
    const response = await axios.get('/api/stock-out');
    setRecords(response.data);
  };

  useEffect(() => {
    loadParts();
    loadRecords();
  }, []);

  const resetForm = () => {
    setForm({ sparePartId: '', stockOutQuantity: 0, stockOutUnitPrice: 0, stockOutDate: '' });
    setEditing(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editing) {
      await axios.put(`/api/stock-out/${editing.id}`, form);
    } else {
      await axios.post('/api/stock-out', form);
    }
    resetForm();
    loadParts();
    loadRecords();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/stock-out/${id}`);
    if (editing?.id === id) resetForm();
    loadParts();
    loadRecords();
  };

  const handleEdit = (record) => {
    setEditing(record);
    const dateString = typeof record.stockOutDate === 'string' 
      ? record.stockOutDate.split('T')[0] 
      : record.stockOutDate;
    setForm({
      sparePartId: record.sparePartId,
      stockOutQuantity: record.stockOutQuantity,
      stockOutUnitPrice: record.stockOutUnitPrice,
      stockOutDate: dateString,
    });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Stock Out</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Spare Part</label>
            <select
              className="w-full"
              value={form.sparePartId}
              onChange={(e) => setForm({ ...form, sparePartId: e.target.value })}
              required
            >
              <option value="">Select spare part</option>
              {parts.map((part) => (
                <option key={part.id} value={part.id}>{part.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={form.stockOutQuantity}
              onChange={(e) => setForm({ ...form, stockOutQuantity: Math.max(0, Number(e.target.value)) })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.stockOutUnitPrice}
              onChange={(e) => setForm({ ...form, stockOutUnitPrice: Math.max(0, Number(e.target.value)) })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.stockOutDate}
              onChange={(e) => setForm({ ...form, stockOutDate: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900">
              {editing ? 'Update Stock Out' : 'Save Stock Out'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-slate-300 rounded-md">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Stock Out Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Spare Part</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Total Price</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{record.id}</td>
                  <td className="px-4 py-3">{record.sparePartName}</td>
                  <td className="px-4 py-3">{record.stockOutQuantity}</td>
                  <td className="px-4 py-3">{record.stockOutUnitPrice}</td>
                  <td className="px-4 py-3">{record.stockOutTotalPrice}</td>
                  <td className="px-4 py-3">{record.stockOutDate}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(record)} className="text-slate-700 hover:text-slate-900">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800">
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

export default StockOut;
