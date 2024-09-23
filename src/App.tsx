import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <nav>
        <ul>
          <li>
            <NavLink to="issue1">Issue 1</NavLink>
          </li>
          <li>
            <NavLink to="issue2">Issue 2</NavLink>
          </li>
        </ul>
      </nav>
      <div className="app-main-container">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
