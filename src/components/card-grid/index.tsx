import { Card } from "@mui/material";
import styles from "./CardGrid.module.css";

type CardGridProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children: React.ReactNode;
  span?: 2 | 3 | 4 | 6 | 12;
  className?: string;
};

export default function CardGrid({
  children,
  span = 12,
  className,
  style,
  ...rest
}: CardGridProps) {
  const allowed =
    span === 2 || span === 3 || span === 4 || span === 6 || span === 12
      ? span
      : 12;
  const widthPercent = `${(allowed / 12) * 100}%`;

  const combinedClassName = className
    ? `${styles.cardGrid} ${className}`
    : styles.cardGrid;

  return (
    <Card
      className={combinedClassName}
      style={{
        width: widthPercent,
        maxWidth: widthPercent,
        flexBasis: widthPercent,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
}
