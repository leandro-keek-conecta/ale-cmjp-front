import { Close } from "@mui/icons-material";
import {
  Backdrop,
  Box,
  Fade,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import styles from "./Modal.module.css";

type PresentationModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PresentationModal({
  open,
  onClose,
}: PresentationModalProps) {
  const [hasAudioConsent, setHasAudioConsent] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open) {
      video.currentTime = 0;
      video.pause();
    } else {
      video.pause();
      video.currentTime = 0;
      setHasAudioConsent(false);
    }
  }, [open]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !hasAudioConsent;
  }, [hasAudioConsent]);

  const handleClose = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setHasAudioConsent(false);
    onClose();
  };

  const handleEnableAudio = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = 0;
      video.muted = false;
      setHasAudioConsent(true);
      if (video.paused) {
        await video.play();
      }
    } catch (error) {
      /* if play is blocked, user can use the native controls */
    }
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
                src="https://s3.keekconecta.com.br/ale-cmjp/videos/ale-apresentacao.mp4"
                controls
                muted={!hasAudioConsent}
                playsInline
                onEnded={handleClose}
              />
              {!hasAudioConsent && (
                <div className={styles.audioPrompt}>
                  <button
                    type="button"
                    className={styles.audioButton}
                    onClick={handleEnableAudio}
                  >
                    Ativar audio
                  </button>
                  <span className={styles.audioHint}>
                    Precisamos do seu clique para liberar o som.
                  </span>
                </div>
              )}
              <div className={styles.videoOverlay} />
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
