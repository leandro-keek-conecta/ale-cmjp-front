import { Fragment } from "react";
import styles from "./sidebar.module.css";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { useLocation } from "react-router-dom";
import { ItemMenu } from "../ItemMenu";
import PageviewIcon from "@mui/icons-material/Pageview";
import AssessmentIcon from "@mui/icons-material/Assessment";

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
            icone={<AssessmentIcon />}
            rotulo="Relatorio de opiniões"
            para="/relatorio-opiniao"
            estaAberta={estaAberta}
            isActive={isActive("/relatorio-opiniao")}
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
          <ItemMenu
            icone={<EditDocumentIcon />}
            rotulo="cadastro de formulário"
            para="/constructor-forms"
            estaAberta={estaAberta}
            isActive={isActive("/constructor-forms")}
            onClick={aoFechar}
          />
        </Fragment>
      </ul>
    </nav>
  );
}
