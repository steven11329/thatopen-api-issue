import { createBrowserRouter } from "react-router-dom";

import App from './App';
import Issue1Page from "./pages/issue1";
import Issue2Page from "./pages/issue2";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: 'issue1',
        element: <Issue1Page />
      },
      {
        path: 'issue2',
        element: <Issue2Page />
      }
    ]
  },
]);

export default router;
