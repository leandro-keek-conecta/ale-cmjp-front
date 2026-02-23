import { useDraggable } from "@dnd-kit/react";
import { useCallback, type ReactNode } from "react";

type DraggableProps = {
  id: string;
  children?: ReactNode;
};

export function Draggable({ id, children }: DraggableProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id,
  });

  const setRefs = useCallback(
    (element: Element | null) => {
      ref(element);
      handleRef(element);
    },
    [ref, handleRef]
  );

  return (
    <button
      type="button"
      ref={setRefs}
      style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      {children ?? "Draggable"}
    </button>
  );
}
