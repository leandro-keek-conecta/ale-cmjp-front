import { deleteProject } from "@/services/projeto/ProjetoService";
import { Dialog,DialogTitle,DialogContent,DialogActions,Button,Typography } from "@mui/material";

interface ModalProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  idProject: number;
  onDeleted?: () => void;
  onError?: (message: string) => void;
}

// ModalProjectDelete.tsx
export function ModalProjectDelete({
  openModal,
  setOpenModal,
  idProject,
  onDeleted,
  onError,
}: ModalProps) {
  async function handleDeleteProject(id: number) {
    try {
      await deleteProject(id);
      if (onDeleted) onDeleted(); // Pai cuida do fechamento e alert
    } catch (error) {
      console.error("Erro ao deletar projeto:", error);
      onError?.("Erro ao deletar projeto.");
    }
  }

  return (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Excluir Projeto?</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Cuidado! Você tem certeza que deseja excluir o projeto e suas informações?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDeleteProject(idProject)}
        >
          Deletar Projeto
        </Button>
      </DialogActions>
    </Dialog>
  );
}
