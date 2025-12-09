import { Close } from "@mui/icons-material";
import {
  Backdrop,
  Box,
  Fade,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";

import styles from "./Modal.module.css";
import alePresentation from "../../assets/ale/ale-apresentacao.mp4";

type PresentationModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PresentationModal({
  open,
  onClose,
}: PresentationModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open) {
      video.currentTime = 0;
      video.play().catch(() => {
        /* autoplay can be blocked; ignore */
      });
    } else {
      video.pause();
    }
  }, [open]);

  const handleClose = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          transitionDuration: 220,
          className: styles.backdrop,
        },
      }}
      aria-labelledby="presentation-modal-title"
      aria-describedby="presentation-modal-description"
    >
      <Fade in={open} timeout={240}>
        <Box className={styles.modalBox}>
          <IconButton
            aria-label="Fechar vídeo de apresentação"
            className={styles.closeButton}
            onClick={handleClose}
          >
            <Close />
          </IconButton>
          <div className={styles.copy}>
            <span className={styles.badge}>Bem-vindo</span>
            <Typography
              id="presentation-modal-title"
              variant="h5"
              sx={{ fontWeight: 800, color: "var(--text)" }}
            >
              Conheça a Alê antes de começar
            </Typography>
            <Typography
              id="presentation-modal-description"
              variant="body2"
              sx={{ color: "var(--muted)" }}
            >
              Assista ao vídeo rápido de apresentação. Quando ele terminar,
              mostramos a experiência completa.
            </Typography>
          </div>
          <div className={styles.videoShell}>
            <div className={styles.videoFrame}>
              <video
                ref={videoRef}
                className={styles.video}
                src={alePresentation}
                autoPlay
                controls
                muted
                playsInline
                onEnded={handleClose}
              />
              <div className={styles.videoOverlay} />
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
