import {
  Box,
  Dialog,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Opinion } from "../../pages/Panorama/Panorama";
import formatDate from "../../utils/formatDate";
import styles from "./cardDetails.module.css";

type CardDetailsProps = {
  opinions: Opinion[];
};

function resolveOpinionDate(opinion: Opinion) {
  return (
    opinion.submittedAt ??
    opinion.createdAt ??
    opinion.startedAt ??
    opinion.horario ??
    null
  );
}

function getOpinionKey(item: Opinion, index: number) {
  const idPart = item.id ?? "opinion";
  const userPart = item.usuario_id ?? "user";
  const timePart = resolveOpinionDate(item) ?? "time";
  const textPart =
    typeof item.texto_opiniao === "string" && item.texto_opiniao.trim()
      ? item.texto_opiniao.trim().slice(0, 40)
      : item.opiniao || `index-${index}`;

  return `${idPart}-${userPart}-${timePart}-${textPart}`;
}

export default function CardDetails({ opinions }: CardDetailsProps) {
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [incomingOpinionKeys, setIncomingOpinionKeys] = useState<string[]>([]);
  const previousOpinionKeysRef = useRef<string[]>([]);
  const animationTimeoutRef = useRef<number | null>(null);

  const normalize = (value?: string | null) =>
    (value || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

  const opinionKeys = useMemo(
    () => opinions.map((item, index) => getOpinionKey(item, index)),
    [opinions],
  );

  useEffect(() => {
    const previousKeys = previousOpinionKeysRef.current;
    const nextIncomingKeys =
      previousKeys.length > 0
        ? opinionKeys.filter((key) => !previousKeys.includes(key))
        : [];

    previousOpinionKeysRef.current = opinionKeys;

    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    setIncomingOpinionKeys(nextIncomingKeys);

    if (!nextIncomingKeys.length) {
      return;
    }

    animationTimeoutRef.current = window.setTimeout(() => {
      setIncomingOpinionKeys([]);
      animationTimeoutRef.current = null;
    }, 900);
  }, [opinionKeys]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

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
      {opinions.map((item, index) => {
        const opinionKey = getOpinionKey(item, index);
        const isIncoming = incomingOpinionKeys.includes(opinionKey);

        return (
          <article
            key={opinionKey}
            className={`${styles.opinionCard} ${
              isIncoming ? styles.opinionCardIncoming : ""
            }`}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardMeta}>
                <div className={styles.name}>{item.nome || "Visitante"}</div>
              </div>
            </div>
            <div className={styles.meta}>
              <span>{item.bairro || "Bairro nao informado"}</span>
              <span>{formatDate(resolveOpinionDate(item))}</span>
            </div>
            <Box
              className={styles.opnionTextClick}
              onClick={() => openModal(item)}
            >
              {item.texto_opiniao ? (
                <p className={styles.opinionText}>
                  {item.texto_opiniao.length > 120
                    ? `${item.texto_opiniao.slice(0, 100)}...`
                    : item.texto_opiniao}
                </p>
              ) : (
                <p className={styles.opinionText}>Sem texto</p>
              )}
            </Box>

            <Box className={styles.cardFooterContainer}>
              <div className={styles.cardFooter}>
                {(() => {
                  const pillType = item.opiniao || "Outro";
                  const pillKey = normalize(pillType) || "outro";
                  return (
                    <span className={styles.pill} data-type={pillKey}>
                      {pillType}
                    </span>
                  );
                })()}
              </div>
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
            </Box>
          </article>
        );
      })}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: "1.2rem", pl: 2, pb: 1, mb: 0 }}>
          {selectedOpinion?.nome || "Opiniao completa"}
        </DialogTitle>
        <Divider sx={{ mt: 0, mb: 2 }} />
        <DialogContentText
          component="div"
          sx={{ pl: 2, pr: 2, pb: 2, fontSize: "1rem" }}
        >
          {selectedOpinion?.texto_opiniao || "Sem texto"}
        </DialogContentText>
      </Dialog>
    </>
  );
}
