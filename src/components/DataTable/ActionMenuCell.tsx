import React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface Props {
  row: any;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onCustomAction?: (row: any) => void;
}

export function ActionMenuCell({
  row,
  onEdit,
  onDelete,
  onCustomAction,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            backgroundColor: "white",
            color: "black",
            borderRadius: 1,
            minWidth: 160,
            "& .MuiMenuItem-root": {
              fontWeight: 500,
              fontSize: "0.9rem",
              "&:hover": { backgroundColor: "#EE8552", color: "white" },
            },
          },
        }}
      >
        {onEdit && (
          <MenuItem
            onClick={() => {
              onEdit(row);
              handleClose();
            }}
          >
            Editar
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={() => {
              onDelete(row);
              handleClose();
            }}
          >
            Excluir
          </MenuItem>
        )}
        {onCustomAction && (
          <MenuItem
            onClick={() => {
              onCustomAction(row);
              handleClose();
            }}
          >
            Ação personalizada
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
