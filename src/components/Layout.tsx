
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export const Layout = () => {
  return (
    <div className="fixed inset-0 flex flex-col">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/lovable-uploads/abd1265e-f3c6-48c9-ae6b-4dc2cd592883.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="container max-w-lg mx-auto px-4 pb-24 pt-4 animate-in">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
