import { Box, Card, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import styles from "./Slide.module.css";
import PlaceIcon from "@mui/icons-material/Place";

export default function SlideComponent() {
  const minioBase = "https://s3.keekconecta.com.br/ale-cmjp/fotos";
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % aleSlides.length);
    }, 5200);

    return () => clearInterval(timer);
  }, []);

  const aleSlides = [
    {
      title: "Alê pronta para responder",
      description:
        "Interface humanizada para tirar dúvidas da população a qualquer hora.",
      image: `${minioBase}/ale-1.jpg`,
    },
    {
      title: "Assistente presente nas ruas",
      description:
        "Alê registra solicitações diretamente dos bairros e agiliza o atendimento.",
      image: `${minioBase}/ale-2.jpg`,
    },
    {
      title: "Conversas claras e objetivas",
      description:
        "Painel mostra o que a Alê está ouvindo em tempo real, sem complicação.",
      image: `${minioBase}/ale-5.png`,
    },
  ];

  return (
    <Box
      className={styles.aleSlider}
      aria-label="Galeria da assistente virtual Alê"
    >
      <div className={styles.aleSliderCopy}>
        <span className={styles.aleBadge}>Alê, assistente virtual</span>
        <Card sx={{p:2, borderRadius: 4, width: "80%"}}>
          <Box className={styles.cardMapHeader}>
            <PlaceIcon color="primary" />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#000000a2" }}
            >
              Presença ativa nos bairros
            </Typography>
          </Box>
          <Box className={styles.cardMapBody}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#000000a2" }}
            >
              Alé registra solicitações diretamente nas comunidades.
            </Typography>
          </Box>
        </Card>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "var(--text)" }}
          >
            {aleSlides[currentSlide].title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--muted)", maxWidth: 520 }}
          >
            {aleSlides[currentSlide].description}
          </Typography>
          <div className={styles.aleControls}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() =>
                setCurrentSlide(
                  (prev) => (prev - 1 + aleSlides.length) % aleSlides.length
                )
              }
              aria-label="Slide anterior"
            >
              <ArrowBackIosNew fontSize="small" />
            </button>
            <div
              className={styles.dots}
              role="tablist"
              aria-label="Alternar imagens da Alê"
            >
              {aleSlides.map((_, idx) => (
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
                setCurrentSlide((prev) => (prev + 1) % aleSlides.length)
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
          src={aleSlides[currentSlide].image}
          alt={aleSlides[currentSlide].title}
          className={styles.aleImage}
        />
        <div className={styles.mediaOverlay} />
      </div>
    </Box>
  );
}
