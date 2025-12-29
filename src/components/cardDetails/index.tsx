import {
  Box,
  Dialog,
  DialogTitle,
  DialogContentText,
  Divider,
} from "@mui/material";
import type { Opinion } from "../../pages/home/HomePage";
import formatDate from "../../utils/formatDate";
import styles from "./cardDetails.module.css";
import { useState } from "react";

type CardDetailsProps = {
  opinions: Opinion[];
};

export default function CardDetails({ opinions }: CardDetailsProps) {
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const normalize = (value?: string | null) =>
    (value || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

  if (!opinions.length) {
    return <div className={styles.emptyState}>Nenhuma opiniao encontrada.</div>;
  }

  const openModal = (opinion: Opinion) => {
    setSelectedOpinion(opinion);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOpinion(null);
  };

  return (
    <>
      {opinions.map((item) => (
        <article key={item.id} className={styles.opinionCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardMeta}>
              <div className={styles.name}>{item.nome || "Visitante"}</div>
            </div>
          </div>
          <div className={styles.meta}>
            {item.bairro || "Bairro nao informado"} - {formatDate(item.horario)}
          </div>
          <Box
            className={styles.opnionTextClick}
            onClick={() => openModal(item)}
          >
            {item.texto_opiniao ? (
              <p className={styles.opinionText}>
                {item.texto_opiniao.length > 120
                  ? item.texto_opiniao.slice(0, 100) + "..."
                  : item.texto_opiniao}
              </p>
            ) : (
              <p className={styles.opinionText}>Sem texto</p>
            )}
          </Box>

          <div className={styles.cardFooter}>
            {(() => {
              const pillType = item.tipo_opiniao || item.opiniao || "Outro";
              const pillKey = normalize(pillType) || "outro";
              return (
                <span className={styles.pill} data-type={pillKey}>
                  {pillType}
                </span>
              );
            })()}
          </div>
        </article>
      ))}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontSize: "1.2rem", pl: 2, pb: 1, mb: 0}}>{selectedOpinion?.nome || "Opiniao Completa"}</DialogTitle>
        <Divider sx={{ mt: 0, mb: 2}}/>
          <DialogContentText component="div" sx={{pl:2,pr:2, pb: 2, fontSize: "1rem"}}>
            {selectedOpinion?.texto_opiniao || "Sem texto"}
          </DialogContentText>
      </Dialog>
    </>
  );
}
