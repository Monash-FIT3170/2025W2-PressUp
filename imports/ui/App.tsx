import { createBrowserRouter, RouterProvider } from "react-router";
import { HomePage } from "./pages/Home";

const router = createBrowserRouter([
  {
    index: true,
    Component: HomePage,
  },
]);

// TODO: Add global nav component
export const App = () => {
  return (
    <>
      <div>Nav</div>
      <RouterProvider router={router} />
    </>
  );
};
