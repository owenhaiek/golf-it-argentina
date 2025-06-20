
interface FilterPanelBackdropProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FilterPanelBackdrop = ({ isOpen, onClick }: FilterPanelBackdropProps) => {
  return (
    <div 
      className={`fixed inset-0 z-[40] bg-black/50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClick}
      style={{ touchAction: 'none' }}
    />
  );
};
