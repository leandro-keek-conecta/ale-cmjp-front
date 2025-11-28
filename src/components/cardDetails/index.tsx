import type { Opinion } from "../../pages/home/HomePage";
import formatDate from "../../utils/formatDate";
import styles from "./cardDetails.module.css";

type CardDetailsProps = {
  opinions: Opinion[];
};

export default function CardDetails({ opinions }: CardDetailsProps) {
  if (!opinions.length) {
    return <div className={styles.emptyState}>Nenhuma opiniao encontrada.</div>;
  }

  return (
    <>
      {opinions.map((item) => (
        <article key={item.id} className={styles.opinionCard}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.name}>{item.nome || "Visitante"}</div>
              <div className={styles.meta}>
                {item.bairro || "Bairro nao informado"} - {formatDate(item.horario)}
              </div>
            </div>
            <span className={styles.pill}>{item.tipo_opiniao || "Outro"}</span>
          </div>
          <p className={styles.opinionText}>
            {item.texto_opiniao || item.opiniao || "Sem texto"}
          </p>
          <div className={styles.cardFooter}>
            <div className={styles.tags}>
              {item.campanha ? (
                <span className={styles.tag}>Campanha: {item.campanha}</span>
              ) : null}
              {item.acao ? <span className={styles.tag}>Acao: {item.acao}</span> : null}
              {item.outra_opiniao ? (
                <span className={styles.tag}>Outra: {item.outra_opiniao}</span>
              ) : null}
            </div>
            <div className={styles.pillSubtle}>Usuario {item.usuario_id || "novo"}</div>
          </div>
        </article>
      ))}
    </>
  );
}
