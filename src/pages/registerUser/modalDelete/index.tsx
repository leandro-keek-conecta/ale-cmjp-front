import { deleteUser } from "@/services/user/userService";
import { Dialog,DialogTitle,DialogContent,DialogActions,Button,Box,Typography } from "@mui/material";

interface ModalProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  idUser: number;
  onDeleted?: () => void;
}

// ModalUserDelete.tsx
export function ModalUserDelete({ openModal, setOpenModal, idUser, onDeleted }: ModalProps) {
  async function handleDeleteUser(id: number) {
    try {
      await deleteUser(id);
      if (onDeleted) onDeleted(); // Pai cuida do fechamento e alert
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  }

  return (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Excluir Usuário?</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Cuidado! Você tem certeza que deseja excluir o usuário e suas informações?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDeleteUser(idUser)}
        >
          Deletar Usuário
        </Button>
      </DialogActions>
    </Dialog>
  );
}
