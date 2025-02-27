
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <main className="flex-1 container max-w-lg mx-auto px-4 pb-16 pt-4 animate-in">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};
