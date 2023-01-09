import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const auth = useAuth();

  const navigate = useNavigate();

  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center border">
        {/* <!-- Page content here --> */}
        <Outlet />
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        {/* <!-- Sidebar content here --> */}
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          <li>
            <Link to="/protected">Sidebar Item 1</Link>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>

          {auth.currentUser.email && (
            <button
              className="border"
              onClick={() => {
                auth.logout(() => {
                  window.location.reload();
                });
              }}
            >
              Log out
            </button>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Layout;
