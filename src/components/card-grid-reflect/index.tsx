import { Card } from "@mui/material";
import styles from "./CardGridReflect.module.css";

type CardGridReflectProps = {
  children: React.ReactNode;
  /** Quantos 12 avos da linha o card ocupa (4, 6 ou 12). */
  span?: 4 | 6 | 12;
  className?: string;
};

export default function CardGridReflect({
  children,
  span = 12,
  className,
}: CardGridReflectProps) {
  const allowed = span === 4 || span === 6 || span === 12 ? span : 12;
  const widthPercent = `${(allowed / 12) * 100}%`;

  const combinedClassName = className
    ? `${styles.cardGridReflect} ${className}`
    : styles.cardGridReflect;

  return (
    <Card
      className={combinedClassName}
      style={{
        width: widthPercent,
        maxWidth: widthPercent,
        flexBasis: widthPercent,
      }}
    >
      {children}
    </Card>
  );
}
