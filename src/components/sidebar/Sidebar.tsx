import { Fragment } from "react";
import styles from "./sidebar.module.css";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { useLocation } from "react-router-dom";
import { ItemMenu } from "../ItemMenu";
import PageviewIcon from "@mui/icons-material/Pageview";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useAuth } from "@/context/AuthContext";

interface PropriedadesSidebar {
  estaAberta: boolean;
  isMobile?: boolean;
  aoFechar?: () => void;
  noDashboard?: boolean;
}

export function Sidebar({ estaAberta, aoFechar }: PropriedadesSidebar) {
  const location = useLocation();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN";

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
            rotulo="Relatorio de opinioes"
            para="/relatorio-opiniao"
            estaAberta={estaAberta}
            isActive={isActive("/relatorio-opiniao")}
            onClick={aoFechar}
          />

          {isSuperAdmin ? (
            <>
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
                rotulo="cadastro de formulario"
                para="/constructor-forms"
                estaAberta={estaAberta}
                isActive={isActive("/constructor-forms")}
                onClick={aoFechar}
              />
            </>
          ) : null}

          {isAdmin ? (
            <ItemMenu
              icone={<EditDocumentIcon />}
              rotulo="cadastro de formulario"
              para="/constructor-forms"
              estaAberta={estaAberta}
              isActive={isActive("/constructor-forms")}
              onClick={aoFechar}
            />
          ) : null}
        </Fragment>
      </ul>
    </nav>
  );
}
