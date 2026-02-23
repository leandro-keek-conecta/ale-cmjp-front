import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";

interface dropColumn {
  id:string;
  children: ReactNode;
}

export function DroppableColumn({ id, children }:dropColumn) {
  const { ref } = useDroppable({ id });

  return (
    <div ref={ref} style={{ minHeight: 200 }}>
      {children}
    </div>
  );
}
