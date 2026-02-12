import { Box, Card, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import styles from "./Slide.module.css";
import PlaceIcon from "@mui/icons-material/Place";

export type SlideItem = {
  title: string;
  description: string;
  image: string;
};

export type SlideComponentProps = {
  slides?: SlideItem[];
  badge?: string;
  mapTitle?: string;
  mapSubtitle?: string;
  intervalMs?: number;
};

const defaultSlides: SlideItem[] = [
  {
    title: "Pronta para responder",
    description:
      "Interface humanizada para tirar dúvidas da população a qualquer hora.",
    image: "https://s3.keekconecta.com.br/ale-cmjp/fotos/ale-1.jpg",
  },
  {
    title: "Assistente presente nas ruas",
    description:
      "Registra solicitações diretamente dos bairros e agiliza o atendimento.",
    image: "https://s3.keekconecta.com.br/ale-cmjp/fotos/ale-2.jpg",
  },
  {
    title: "Conversas claras e objetivas",
    description:
      "Painel mostra o que está acontecendo em tempo real, sem complicação.",
    image: "https://s3.keekconecta.com.br/ale-cmjp/fotos/ale-5.png",
  },
];

export default function SlideComponent({
  slides,
  badge,
  mapTitle,
  mapSubtitle,
  intervalMs = 12000,
}: SlideComponentProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const resolvedSlides = useMemo(
    () => (slides && slides.length ? slides : defaultSlides),
    [slides],
  );

  useEffect(() => {
    if (!resolvedSlides.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % resolvedSlides.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [resolvedSlides.length, intervalMs]);

  useEffect(() => {
    if (currentSlide >= resolvedSlides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, resolvedSlides.length]);

  return (
    <Box
      className={styles.aleSlider}
      aria-label="Galeria da assistente virtual"
    >
      <div className={styles.aleSliderCopy}>
        <span className={styles.aleBadge}>{badge || "Assistente virtual"}</span>
        <Card sx={{ p: 2, borderRadius: 4, width: "100%", maxWidth: 420 }}>
          <Box className={styles.cardMapHeader}>
            <PlaceIcon color="primary" />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#000000a2" }}
            >
              {mapTitle || "Presença ativa nos bairros"}
            </Typography>
          </Box>
          <Box className={styles.cardMapBody}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#000000a2" }}
            >
              {mapSubtitle || "Participação cidadã descomplicada e eficiente"}
            </Typography>
          </Box>
        </Card>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "var(--text)" }}
          >
            {resolvedSlides[currentSlide]?.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--muted)", maxWidth: 520 }}
          >
            {resolvedSlides[currentSlide]?.description}
          </Typography>
          <div className={styles.aleControls}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() =>
                setCurrentSlide(
                  (prev) =>
                    (prev - 1 + resolvedSlides.length) % resolvedSlides.length,
                )
              }
              aria-label="Slide anterior"
            >
              <ArrowBackIosNew fontSize="small" />
            </button>
            <div
              className={styles.dots}
              role="tablist"
              aria-label="Alternar imagens"
            >
              {resolvedSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.dot} ${
                    idx === currentSlide ? styles.activeDot : ""
                  }`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Mostrar imagem ${idx + 1}`}
                  aria-pressed={idx === currentSlide}
                />
              ))}
            </div>
            <button
              type="button"
              className={styles.navButton}
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % resolvedSlides.length)
              }
              aria-label="Próximo slide"
            >
              <ArrowForwardIos fontSize="small" />
            </button>
          </div>
        </Box>
      </div>
      <div className={styles.aleSliderMedia}>
        <img
          src={resolvedSlides[currentSlide]?.image}
          alt={resolvedSlides[currentSlide]?.title}
          className={styles.aleImage}
        />
        <div className={styles.mediaOverlay} />
      </div>
    </Box>
  );
}
