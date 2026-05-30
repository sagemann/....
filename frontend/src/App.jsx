import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import SpareParts from './components/SpareParts';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Reports from './components/Reports';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:4000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/auth/me').then((response) => {
      if (response.data.authenticated) {
        setUser(response.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register onRegister={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar onLogout={handleLogout} username={user.username} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/spare-parts" replace />} />
          <Route path="/spare-parts" element={<SpareParts />} />
          <Route path="/stock-in" element={<StockIn />} />
          <Route path="/stock-out" element={<StockOut />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/spare-parts" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
