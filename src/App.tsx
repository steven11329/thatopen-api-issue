import { useState } from "react";
import "./App.css";
import ThreeD from "./ThreeD";

function App() {
  const [page, setPage] = useState<"3d" | "other">("3d");
  return (
    <div className="app-container">
      <div className="operation-container">
        <button
          onClick={() => {
            setPage("3d");
          }}
        >
          3D
        </button>
        <button
          onClick={() => {
            setPage("other");
          }}
        >
          Other Page
        </button>
      </div>
      {page === "3d" && <ThreeD />}
      {page === "other" && <div className="other-page-container">Other Page</div>}
    </div>
  );
}

export default App;
