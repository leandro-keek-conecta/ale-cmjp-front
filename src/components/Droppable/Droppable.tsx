import {useDroppable} from '@dnd-kit/react';

type Props = {
  id: string;
  children: React.ReactNode;
};

export function Droppable({id, children}:Props) {
  const {ref} = useDroppable({
    id,
  });

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        minHeight: "100%",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
