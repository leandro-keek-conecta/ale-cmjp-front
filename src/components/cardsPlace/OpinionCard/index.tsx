import {
  Box,
  Dialog,
  Divider,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Opinion } from "../../../types/opinion";
import formatDate from "../../../utils/formatDate";
import styles from "./cardDetails.module.css";

type CardDetailsProps = {
  opinions: Opinion[];
};

function resolveOpinionDate(opinion: Opinion) {
  return (
    opinion.submittedAt ??
    opinion.completedAt ??
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

function getInitials(name: string | undefined): string {
  if (!name || !name.trim()) return "V";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeType(value?: string | null): string {
  return (value || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export default function CardDetails({ opinions }: CardDetailsProps) {
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [incomingOpinionKeys, setIncomingOpinionKeys] = useState<string[]>([]);
  const previousOpinionKeysRef = useRef<string[]>([]);
  const animationTimeoutRef = useRef<number | null>(null);

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
        const typeKey = normalizeType(item.opiniao) || "outro";
        const categoryKey = normalizeType(item.tipo_opiniao || item.opiniao) || "outro";

        return (
          <article
            key={opinionKey}
            className={`${styles.opinionCard} ${
              isIncoming ? styles.opinionCardIncoming : ""
            }`}
          >
            {/* Accent strip */}
            <div className={styles.accentStrip} data-type={typeKey} />

            <div className={styles.cardInner}>
              {/* Header */}
              <div className={styles.cardHeader}>
                <div className={styles.avatar} data-type={typeKey}>
                  {getInitials(item.nome)}
                </div>
                <div className={styles.headerInfo}>
                  <div className={styles.name}>
                    {item.nome || "Visitante"}
                  </div>
                  <div className={styles.meta}>
                    <span>{item.bairro || "Bairro nao informado"}</span>
                    <span className={styles.metaDot} />
                    <span>{formatDate(resolveOpinionDate(item))}</span>
                  </div>
                </div>
              </div>

              {/* Opinion text */}
              <Box
                className={styles.opnionTextClick}
                onClick={() => openModal(item)}
              >
                <div className={styles.opinionTextWrap} data-type={typeKey}>
                  <span className={styles.quoteIcon}>&ldquo;</span>
                  {item.texto_opiniao ? (
                    <p className={styles.opinionText}>
                      {item.texto_opiniao.length > 120
                        ? `${item.texto_opiniao.slice(0, 100)}...`
                        : item.texto_opiniao}
                    </p>
                  ) : (
                    <p className={styles.opinionText}>Sem texto</p>
                  )}
                </div>
                <span className={styles.readMore}>
                  Ler mais <span className={styles.readMoreArrow}>&rarr;</span>
                </span>
              </Box>

              {/* Footer pills */}
              <Box className={styles.cardFooterContainer}>
                <div className={styles.cardFooter}>
                  <span className={styles.pill} data-type={typeKey}>
                    {item.opiniao || "Outro"}
                  </span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.pill} data-type={categoryKey}>
                    {item.tipo_opiniao || item.opiniao || "Outro"}
                  </span>
                </div>
              </Box>
            </div>
          </article>
        );
      })}

      {/* Enhanced modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "18px",
            overflow: "hidden",
          },
        }}
      >
        {selectedOpinion && (
          <>
            <div className={styles.modalHeader}>
              <div
                className={styles.modalAvatar}
                data-type={normalizeType(selectedOpinion.opiniao)}
              >
                {getInitials(selectedOpinion.nome)}
              </div>
              <div className={styles.modalHeaderInfo}>
                <div className={styles.modalName}>
                  {selectedOpinion.nome || "Visitante"}
                </div>
                <div className={styles.modalMeta}>
                  <span>
                    {selectedOpinion.bairro || "Bairro nao informado"}
                  </span>
                  <span className={styles.metaDot} />
                  <span>
                    {formatDate(resolveOpinionDate(selectedOpinion))}
                  </span>
                </div>
              </div>
            </div>
            <Divider />
            <div className={styles.modalBody}>
              {selectedOpinion.texto_opiniao || "Sem texto"}
            </div>
            <div className={styles.modalPills}>
              <span
                className={styles.pill}
                data-type={normalizeType(selectedOpinion.opiniao)}
              >
                {selectedOpinion.opiniao || "Outro"}
              </span>
              <span
                className={styles.pill}
                data-type={normalizeType(
                  selectedOpinion.tipo_opiniao || selectedOpinion.opiniao,
                )}
              >
                {selectedOpinion.tipo_opiniao ||
                  selectedOpinion.opiniao ||
                  "Outro"}
              </span>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
