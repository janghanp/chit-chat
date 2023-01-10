import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import defaultAvatar from "/default.jpg";

const Layout = () => {
  const auth = useAuth();

  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-start border">
        {/* <!-- Page content here --> */}
        <Outlet />
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        {/* <!-- Sidebar content here --> */}
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>

          {auth.currentUser.email && (
            <>
              <img className="border" src={auth.currentUser.avatar || defaultAvatar} width={50} height={50} />
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
              <Link to="/settings">
                <button className="border w-full">config</button>
              </Link>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Layout;
