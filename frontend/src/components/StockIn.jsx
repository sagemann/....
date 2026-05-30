import { useEffect, useState } from 'react';
import axios from 'axios';

function StockIn() {
  const [parts, setParts] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ sparePartId: '', stockInQuantity: 0, stockInDate: '' });

  const loadParts = async () => {
    const response = await axios.get('/api/spare-parts');
    setParts(response.data);
  };

  const loadRecords = async () => {
    const response = await axios.get('/api/stock-in');
    setRecords(response.data);
  };

  useEffect(() => {
    loadParts();
    loadRecords();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post('/api/stock-in', form);
    setForm({ sparePartId: '', stockInQuantity: 0, stockInDate: '' });
    loadParts();
    loadRecords();
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Stock In</h2>
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
              value={form.stockInQuantity}
              onChange={(e) => setForm({ ...form, stockInQuantity: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.stockInDate}
              onChange={(e) => setForm({ ...form, stockInDate: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900">
              Save Stock In
            </button>
          </div>
        </form>
      </section>
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Stock In Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Spare Part</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{record.id}</td>
                  <td className="px-4 py-3">{record.sparePartName}</td>
                  <td className="px-4 py-3">{record.stockInQuantity}</td>
                  <td className="px-4 py-3">{record.stockInDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StockIn;
