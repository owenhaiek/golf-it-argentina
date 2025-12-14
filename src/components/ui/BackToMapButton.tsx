
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const BackToMapButton = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
      }}
    >
      <Button 
        onClick={() => navigate('/')}
        className="pointer-events-auto h-14 px-8 rounded-full bg-primary hover:bg-primary/90 shadow-2xl text-base font-semibold gap-2"
      >
        <Map className="w-5 h-5" />
        Volver al Mapa
      </Button>
    </motion.div>
  );
};
