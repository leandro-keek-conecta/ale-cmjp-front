import {
  Box,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  ArrowBackIosNew,
  ArrowForwardIos,
} from "@mui/icons-material";
import styles from "./Slide.module.css";
import aleSlide1 from "../../assets/ale/ale-1.jpg";
import aleSlide2 from "../../assets/ale/ale-2.jpg";
import aleSlide3 from "../../assets/ale/ale-3.jpg";
export default function SlideComponent() {
  const [upDistricts, setUpDistricts] = useState();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [initial, setInitial] = useState(true);

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
      image: aleSlide1,
    },
    {
      title: "Assistente presente nas ruas",
      description:
        "Alê registra solicitações diretamente dos bairros e agiliza o atendimento.",
      image: aleSlide2,
    },
    {
      title: "Conversas claras e objetivas",
      description:
        "Painel mostra o que a Alê está ouvindo em tempo real, sem complicação.",
      image: aleSlide3,
    },
  ];

  return (
    <Box
      className={styles.aleSlider}
      aria-label="Galeria da assistente virtual Alê"
    >
      <div className={styles.aleSliderCopy}>
        <span className={styles.aleBadge}>Alê, assistente virtual</span>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--text)" }}>
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
