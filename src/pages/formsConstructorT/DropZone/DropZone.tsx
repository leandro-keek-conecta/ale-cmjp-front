import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";

type DropZoneProps = {
  id: string;
  className: string;
  activeClassName: string;
  children: ReactNode;
};

export default function DropZone({ id, className, activeClassName, children }: DropZoneProps) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div className={`${className} ${isDropTarget ? activeClassName : ""}`} ref={ref}>
      {children}
    </div>
  );
}