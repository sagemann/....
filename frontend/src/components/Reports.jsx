import { useEffect, useState } from 'react';
import axios from 'axios';

function Reports() {
  const [daily, setDaily] = useState([]);
  const [status, setStatus] = useState([]);

  const loadReports = async () => {
    const [dailyRes, statusRes] = await Promise.all([
      axios.get('/api/reports/daily-stock-out'),
      axios.get('/api/reports/stock-status'),
    ]);
    setDaily(dailyRes.data);
    setStatus(statusRes.data);
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Stock Out Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Spare Part</th>
                <th className="px-4 py-3">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((item, index) => (
                <tr key={index} className="border-t border-slate-200">
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">{item.sparePart}</td>
                  <td className="px-4 py-3">{item.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Stock Status Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3">Spare Part</th>
                <th className="px-4 py-3">Stored Quantity</th>
                <th className="px-4 py-3">Stock Out Quantity</th>
                <th className="px-4 py-3">Remaining Quantity</th>
              </tr>
            </thead>
            <tbody>
              {status.map((item, index) => (
                <tr key={index} className="border-t border-slate-200">
                  <td className="px-4 py-3">{item.sparePart}</td>
                  <td className="px-4 py-3">{item.storedQuantity}</td>
                  <td className="px-4 py-3">{item.stockOutQuantity}</td>
                  <td className="px-4 py-3">{item.remainingQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Reports;
