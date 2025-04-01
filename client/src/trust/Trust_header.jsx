import { Outlet,Link } from 'react-router-dom'
function Trust_header() {
  return (
    <div className='mt-3 ms-3'>
        <ul className="nav d-flex justify-content-between">
            <p className="display-6">SupportRoots</p>
            <div className='d-flex'>
            <li className="nav-item">
                <Link className="nav-link fs-3" to="villages">Villages</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link fs-3" to="users">Users</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link fs-3" to="profile">Profile</Link>
            </li>
            </div>
        </ul>
      <Outlet></Outlet>
    </div>
  )
}

export default Trust_header
