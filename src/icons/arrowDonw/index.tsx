import { useRef, useState } from "react";
import { Box } from "@mui/material";
import arrowDown from "../../assets/animations/Arrowdown.json";
import type { LottieRefCurrentProps } from "lottie-react";
import Lottie from "lottie-react";

export function ArrowDown() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [rotated, setRotated] = useState(false);

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        cursor: "pointer",
        transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.25s ease",
      }}
      onClick={() => setRotated((prev) => !prev)}
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => lottieRef.current?.goToAndStop(0, true)}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={arrowDown}
        autoplay={false}
        loop={false}
        style={{ width: "100%", height: "100%" }}
      />
    </Box>
  );
}
