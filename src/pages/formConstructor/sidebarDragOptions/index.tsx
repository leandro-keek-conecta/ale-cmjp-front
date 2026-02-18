import { Fragment } from "react";
import styles from "./sidebar.module.css";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { useLocation } from "react-router-dom";
import PageviewIcon from "@mui/icons-material/Pageview";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { ItemMenu } from "@/components/ItemMenu";

interface PropriedadesSidebar {
  estaAberta: boolean;
  isMobile?: boolean;
  aoFechar?: () => void;
  noDashboard?: boolean;
}

export function Sidebar({ estaAberta, aoFechar }: PropriedadesSidebar) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className={styles.sidebarNav}>
      <ul className={styles.ulStyle}>
        <Fragment>
          <ItemMenu rotulo="Menu" isTitle estaAberta={estaAberta} />
          <ItemMenu
            icone={<PageviewIcon />}
            rotulo="Visao geral"
            para="/panorama"
            estaAberta={estaAberta}
            isActive={isActive("/panorama")}
            onClick={aoFechar}
          />
          <ItemMenu
            icone={<AssessmentIcon />}
            rotulo="Relatorios"
            para="/relatorio"
            estaAberta={estaAberta}
            isActive={isActive("/relatorio")}
            onClick={aoFechar}
          />
          <ItemMenu
            icone={<EditDocumentIcon />}
            rotulo="cadastro de tema"
            para="/cadastro-thema"
            estaAberta={estaAberta}
            isActive={isActive("/cadastro-thema")}
            onClick={aoFechar}
          />
        </Fragment>
      </ul>
    </nav>
  );
}
