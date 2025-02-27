
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export const Layout = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#F1F0FB]">
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="container max-w-lg mx-auto px-4 pb-24 pt-4 animate-in">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
