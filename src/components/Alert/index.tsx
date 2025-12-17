  // components/Alert/index.tsx
  import style from "./alert.module.css";
  import Alert from "@mui/material/Alert";
  import Stack from "@mui/material/Stack";
  import Collapse from "@mui/material/Collapse";
  import IconButton from "@mui/material/IconButton";
  import CloseIcon from "@mui/icons-material/Close";
  import { useEffect, useState } from "react";

  interface AlertProps {
    category?: "error" | "info" | "warning" | "success";
    title: string;
    onClose?: () => void;
    autoHideDuration?: number; // novo
  }

  export default function CustomAlert({
    category = "info",
    title,
    onClose,
    autoHideDuration = 5000,
  }: AlertProps) {
    const [open, setOpen] = useState(true);

    useEffect(() => {
      if (!open) return;

      const timer = setTimeout(() => {
        setOpen(false);
        onClose?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }, [open, autoHideDuration, onClose]);

    return (
      <Stack className={style.alertContainer}>
        <Collapse in={open}>
          <Alert
            variant="filled"
            severity={category}
            className={style.alert}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                  onClose?.();
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {title}
          </Alert>
        </Collapse>
      </Stack>
    );
  }
