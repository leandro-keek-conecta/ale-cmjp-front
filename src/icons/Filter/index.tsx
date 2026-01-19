import { useRef } from "react";
import { Box } from "@mui/material";
import filterAnimation from "../../assets/animations/Filter.json";
import type { LottieRefCurrentProps } from "lottie-react";
import Lottie from "lottie-react";

export function ClimaIcon() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        cursor: "pointer",
      }}
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => lottieRef.current?.stop()}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={filterAnimation}
        loop={false}
        autoplay={false}
        style={{ width: "100%", height: "100%" }}
      />
    </Box>
  );
}
