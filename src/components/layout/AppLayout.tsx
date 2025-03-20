
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
