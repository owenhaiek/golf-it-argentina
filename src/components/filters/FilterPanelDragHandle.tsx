
interface FilterPanelDragHandleProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const FilterPanelDragHandle = ({
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown
}: FilterPanelDragHandleProps) => {
  return (
    <div 
      className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted cursor-pointer touch-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    />
  );
};
