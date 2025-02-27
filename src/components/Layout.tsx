
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-muted overflow-y-auto">
      <main className="flex-1 container max-w-lg mx-auto px-4 pb-24 pt-4 animate-in">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};
