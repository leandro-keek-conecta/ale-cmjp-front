import { Fragment } from "react";
import styles from "./sidebar.module.css";
import ChatIcon from "@mui/icons-material/Chat";
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
              para="/panorama"
              estaAberta={estaAberta}
              isActive={isActive("/panorama")}
            />
            <ItemMenu
              icone={<ChatIcon />}
              rotulo="⁠Relatórios"
              para="/relatorio"
              estaAberta={estaAberta}
              isActive={isActive("/relatorio")}
            />
            <ItemMenu
              icone={<ChatIcon />}
              rotulo="cadastro de tema"
              para="/cadastro-thema"
              estaAberta={estaAberta}
              isActive={isActive("/cadastro-thema")}
            />
          </Fragment>
        </ul>
    </nav>
  );
}
