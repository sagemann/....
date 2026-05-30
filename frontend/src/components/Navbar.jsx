import { NavLink } from 'react-router-dom';

function Navbar({ username, onLogout }) {
  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <header className="navbar">
      <div>
        <h1>App</h1>
        <p>Logged in as {username}</p>
      </div>
      <div className="nav-links">
        <NavLink to="/spare-parts" className={linkClass}>Parts</NavLink>
        <NavLink to="/stock-in" className={linkClass}>Stock In</NavLink>
        <NavLink to="/stock-out" className={linkClass}>Stock Out</NavLink>
        <NavLink to="/reports" className={linkClass}>Reports</NavLink>
        <button onClick={onLogout} className="nav-button">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
