import { Card } from "@mui/material";
import styles from "./CardGridReflect.module.css";

type CardGridReflectProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: React.ReactNode;
  /** Quantos 12 avos da linha o card ocupa (3, 4, 6 ou 12). */
  span?: 3 | 4 | 6 | 12;
  /** Remove o padding interno do card mantendo o restante do estilo. */
  disablePadding?: boolean;
};

export default function CardGridReflect({
  children,
  span = 12,
  disablePadding = false,
  className,
  style,
  ...rest
}: CardGridReflectProps) {
  const allowed = span === 3 || span === 4 || span === 6 || span === 12 ? span : 12;
  const widthPercent = `calc(((100% - (11 * var(--card-gap, 16px))) / 12) * ${allowed} + (${allowed - 1} * var(--card-gap, 16px)))`;

  const combinedClassName = [
    styles.cardGridReflect,
    disablePadding ? styles.noPadding : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

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
