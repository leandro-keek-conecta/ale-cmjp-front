import { useRef, useState } from "react";
import { Box } from "@mui/material";
import arrowDown from "../../assets/animations/Arrowdown.json";
import type { LottieRefCurrentProps } from "lottie-react";
import Lottie from "lottie-react";

type ArrowDownProps = {
  rotated?: boolean;
  disableToggle?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export function ArrowDown({
  rotated,
  disableToggle = false,
  className,
  onClick,
}: ArrowDownProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [internalRotated, setInternalRotated] = useState(false);
  const isControlled = typeof rotated === "boolean";
  const resolvedRotated = isControlled ? rotated : internalRotated;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isControlled && !disableToggle) {
      setInternalRotated((prev) => !prev);
    }
    onClick?.(event);
  };

  return (
    <Box
      className={className}
      sx={{
        width: 40,
        height: 40,
        cursor: "pointer",
        transform: resolvedRotated ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.25s ease",
      }}
      onClick={handleClick}
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
