import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { villageContext } from '../Context/LoginV_Context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './vill_header.css'; // We will properly style

function Village_header() {
  const { userLogout } = useContext(villageContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    userLogout();
    navigate("/village/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`layout-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Top Bar */}
      <div className="topbar">
        <button className="open-btn" onClick={toggleSidebar}>☰</button>
        <h1 className="logo">SupportRoots</h1>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>Menu</h4>
          <button className="close-btn" onClick={closeSidebar}>✖</button>
        </div>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <Link className="nav-link" to="add-problem" onClick={closeSidebar}>
              Add Problem
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="accepted" onClick={closeSidebar}>
              Accepted Problems
            </Link>
          </li>
          <li className="nav-item mt-4">
            <button onClick={handleLogout} className="btn btn-danger w-100 p-2">
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Village_header;