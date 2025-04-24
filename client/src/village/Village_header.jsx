import { Outlet,Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { villageContext } from '../Context/LoginV_Context'
function Village_header() {
  const {userLogout}=useContext(villageContext)
  const navigate = useNavigate()
  const handleLogout = () => {
    userLogout();
    navigate("/village/login"); // Redirect after logout
  };

  return (
    <div>
      <div className='mt-3 ms-3'>
        <ul className="nav d-flex justify-content-between">
            <p className="display-6">SupportRoots</p>
            <div className='d-flex'>
            <li className="nav-item">
                <Link className="nav-link fs-3" to="trusts">Trusts</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link fs-3" to="users">Users</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link fs-3" to="profile">Profile</Link>
            </li>
            <li>
              <Link className="nav-link fs-3" to="add-problem">Add Problem</Link>
            </li>
            <li>
              <button onClick={handleLogout} className='btn btn-danger p-2'>LogOut</button>
            </li>
            
            </div>
        </ul>
    </div>
    <div className="px-3">
        <Outlet />
      </div>
    </div>
  )
}

export default Village_header
