import React from "react";
import { Link } from "react-router-dom";
import styles from "./itemMenu.module.css";
import { useTheme } from "@mui/material/styles";

interface ItemMenuProps {
  icone?: React.ReactElement<{ style?: React.CSSProperties }>;
  rotulo: string;
  para?: string;
  estaAberta: boolean;
  onClick?: () => void;
  isTitle?: boolean;
  isActive?: boolean; // ← nova prop
}

export function ItemMenu({
  icone,
  rotulo,
  para,
  estaAberta,
  onClick,
  isTitle,
  isActive = false,
}: ItemMenuProps) {
  const theme = useTheme();
  const color = "#2d80cf";

  const isPlaceholder = !para || para === "#";
  const menuItemClassName = `${styles.menuItem} ${
    isActive ? styles.ativo : ""
  }`;

  const content = (
    <>
      {icone && (
        <div className={styles.icon}>
          {React.cloneElement(icone, { style: { fontSize: "0.9rem" } })}
        </div>
      )}
      {estaAberta && (
        <span className={`${styles.label} ${isTitle ? styles.title : ""}`}>
          {rotulo}
        </span>
      )}
    </>
  );

  // 🔹 Título (sem ação)
  if (isTitle) {
    return (
      <li>
        <div
          className={styles.menuItem}
          style={{
            cursor: "default",
            padding: "0px 0px",
            fontWeight: "bold",
            fontSize: "0.8rem",
          }}
        >
          {content}
        </div>
      </li>
    );
  }

  // 🔹 Item clicável (Power BI)
  if (isPlaceholder) {
    return (
      <li>
        <div
          className={`${styles.menuItem} ${styles.clicavel}`}
          onClick={onClick}
          style={{
            cursor: "pointer",
            backgroundColor: isActive ? color : "transparent",
            color: isActive ? theme.palette.primary.contrastText : "inherit",
            fontWeight: isActive ? 500 : 400,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isActive)
              (e.currentTarget as HTMLElement).style.background = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            if (!isActive)
              (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          {content}
        </div>
      </li>
    );
  }

  // 🔹 Links normais (mantém compatibilidade)
  return (
    <li>
      <Link to={para as string} className={menuItemClassName} onClick={onClick}>
        {content}
      </Link>
    </li>
  );
}
