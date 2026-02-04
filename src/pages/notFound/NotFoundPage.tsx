import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "Erro 404: tentativa de acesso a uma rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <main className={styles.main}>
        <section className={styles.content}>
          <span className={styles.badge}>Ouvidoria Digital</span>

          <h1 className={styles.title}>
            <span className={styles.titleCode}>404</span>
            <span className={styles.titleText}>Oops! Página não encontrada</span>
          </h1>

          <p className={styles.subtitle}>
            Não foi possível localizar esta página no sistema de ouvidoria.
            Ela pode ter sido removida, alterada ou o endereço informado está incorreto.
          </p>

          <div className={styles.routeBox}>
            <span className={styles.routeLabel}>Rota solicitada</span>
            <code className={styles.routeValue}>{location.pathname}</code>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primary} to="/">
              Voltar para a página inicial
            </Link>

            <button
              className={styles.secondary}
              type="button"
              onClick={() => window.history.back()}
            >
              Voltar
            </button>
          </div>

          <p className={styles.hint}>
            Dica: você pode retornar para acompanhar suas manifestações
            ou iniciar um novo registro na ouvidoria.
          </p>
        </section>

        <aside className={styles.scene} aria-hidden="true">
          <div className={styles.radar}>
            <span className={styles.radarGrid} />
            <span className={`${styles.dot} ${styles.dotOne}`} />
            <span className={`${styles.dot} ${styles.dotTwo}`} />
            <span className={`${styles.dot} ${styles.dotThree}`} />
          </div>

          <div className={`${styles.messageCard} ${styles.messageOne}`}>
            <span className={styles.messageTag}>Manifestação</span>
            <span className={styles.messageText}>Registro em análise</span>
          </div>

          <div className={`${styles.messageCard} ${styles.messageTwo}`}>
            <span className={styles.messageTag}>Sugestão</span>
            <span className={styles.messageText}>Encaminhada ao setor responsável</span>
          </div>

          <div className={`${styles.messageCard} ${styles.messageThree}`}>
            <span className={styles.messageTag}>Elogio</span>
            <span className={styles.messageText}>Feedback recebido</span>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default NotFound;
