import { Fragment } from "react";
import styles from "./sidebar.module.css";
import ChatIcon from "@mui/icons-material/Chat";
import { Skeleton, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ItemMenu } from "../ItemMenu";


interface PropriedadesSidebar {
  estaAberta: boolean;
  isMobile?: boolean;
  aoFechar?: () => void;
  // opcional: se a página pai souber que NÃO há dashboard, pode passar true aqui e pulamos o skeleton
  noDashboard?: boolean;
}

export function Sidebar({
  estaAberta,
}: PropriedadesSidebar) {
  const location = useLocation();
        
  // se não houver reportInstance e também não vieram páginas após um tempo, ativa fallbac

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };



  return (
    <nav className={styles.sidebarNav}>
        <ul className={styles.ulStyle}>
          <Fragment>
            <ItemMenu rotulo="Menu" isTitle estaAberta={estaAberta} />
            <ItemMenu
              icone={<ChatIcon />}
              rotulo="Visão geral"
              para="/"
              estaAberta={estaAberta}
              isActive={isActive("/")}
            />
            <ItemMenu
              icone={<ChatIcon />}
              rotulo="⁠Relatórios"
              para="/relatorio"
              estaAberta={estaAberta}
              isActive={isActive("/relatorio")}
            />
          </Fragment>
        </ul>
    </nav>
  );
}

/* ---------- Skeleton do menu ---------- */
function SkeletonMenu({ estaAberta }: { estaAberta: boolean }) {
  const itemH = 36;
  return (
    <>
      <li>
        <Box className={styles.menuItem} sx={{ py: 0.5 }}>
          <Skeleton variant="text" width={estaAberta ? 140 : 24} height={20} />
        </Box>
      </li>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={`sk-${i}`}>
          <Box
            className={styles.menuItem}
            sx={{
              height: itemH,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Skeleton variant="circular" width={16} height={16} />
            {estaAberta && (
              <Skeleton variant="text" width={120 + (i % 3) * 50} height={18} />
            )}
          </Box>
        </li>
      ))}
    </>
  );
}
