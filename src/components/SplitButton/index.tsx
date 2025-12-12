import * as React from "react";
import { Avatar, IconButton, Menu, MenuItem, Fade, Box } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export interface MenuOption {
  icone?: React.ReactElement;
  label: string;
  value?: string | number;
  onClick?: () => void;
  disabled?: boolean;
}

interface UserMenuMinimalProps {
  avatar?: {
    src?: string;
    alt?: string;
    fallback?: string;
  };
  options: MenuOption[];
}

export default function UserMenuMinimal({
  avatar,
  options,
}: UserMenuMinimalProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: "inherit",
        }}
      >
        <Avatar
          alt={avatar?.alt || "Usuário"}
          src={avatar?.src}
          sx={{
            width: 28,
            height: 28,
            bgcolor: "primary",
            fontSize: 14,
          }}
        >
          {avatar?.fallback || "A"}
        </Avatar>
        <ArrowDropDownIcon fontSize="medium" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {options.map((opt, index) => (
          <MenuItem
            key={index}
            disabled={opt.disabled}
            onClick={() => {
              opt.onClick?.();
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.9rem" }}
          >
            {opt.icone && (
              <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                {React.cloneElement(opt.icone, { style: { fontSize: "1rem" } })}
              </Box>
            )}
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
