import { Layout } from "@/components/layout/Layout";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import styles from "./RegisterProject.module.css";
import ExpandableCard from "@/components/expandable-card";
import type { ProjetoBasicFormValues } from "@/types/IProjetoType";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import Forms from "@/components/Forms";
import { getProjetoBasicInputs } from "./inputs/projectInput";
import { generateSlug } from "@/utils/generateSlug";
import { fetchUsers } from "@/services/user/userService";
import type User from "@/types/IUserType";
import type Projeto from "@/types/IProjetoType";
import getProjects, {
  createProject,
  updateProject,
} from "@/services/projeto/ProjetoService";
import { GenericDataTable } from "@/components/DataTable";
import { columnsProjects } from "./colunsOfProject/colunsProjectData";
import formatDate from "@/utils/formatDate";
import { ModalProjectDelete } from "./modalDelete";
import CustomAlert from "@/components/Alert";

type AlertState = {
  show: boolean;
  category?: "success" | "error" | "info" | "warning";
  title?: string;
};

export default function RegisterProject() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [userOptions, setUserOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertState>({ show: false });
  const buildDefaultValues = (): ProjetoBasicFormValues => ({
    name: "",
    slug: "",
    cliente: "",
    descricaoCurta: "",
    reportId: "",
    groupId: "",
    corHex: "",
    logoUrl: "",
    ativo: true,
  });
  const {
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjetoBasicFormValues>({
    defaultValues: buildDefaultValues(),
  });
  const nameValue = watch("name");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const generatedSlug = generateSlug(nameValue ?? "");

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setValue("slug", generatedSlug, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [generatedSlug, isSlugManuallyEdited, setValue]);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? (data as Projeto[]) : []);
    } catch (err) {
      console.error("Erro ao buscar projetos", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const projectRows = useMemo(() => {
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug ?? "",
      createdAt: formatDate(project.createdAt),
    }));
  }, [projects]);

  useEffect(() => {
    let isMounted = true;
    fetchUsers()
      .then((users: User[]) => {
        if (!isMounted) {
          return;
        }
        const options = users
          .map((user) => {
            const label = user.name?.trim() || user.email?.trim();
            if (!label) {
              return null;
            }
            return { label, value: label };
          })
          .filter(
            (option): option is { label: string; value: string } =>
              option !== null,
          );
        setUserOptions(options);
      })
      .catch((error) => {
        console.error("Erro ao carregar usuários:", error);
        if (isMounted) {
          setUserOptions([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancelEdit = () => {
    reset(buildDefaultValues());
    setIsEditing(false);
    setEditingProjectId(null);
    setIsSlugManuallyEdited(false);
  };

  const handleEditProject = (row: { id: number }) => {
    
    const selected = projects.find((project) => project.id === row.id);
    if (!selected) return;

    reset({
      ...buildDefaultValues(),
      name: selected.name ?? "",
      slug: selected.slug ?? "",
      cliente: (selected as any)?.cliente ?? "",
      descricaoCurta: (selected as any)?.descricaoCurta ?? "",
      reportId: (selected as any)?.reportId ?? "",
      groupId: (selected as any)?.groupId ?? "",
      corHex: (selected as any)?.corHex ?? "",
      logoUrl: (selected as any)?.logoUrl ?? "",
      ativo:
        typeof (selected as any)?.ativo === "boolean"
          ? (selected as any).ativo
          : true,
    });

    setIsEditing(true);
    setExpanded(true);
    setEditingProjectId(selected.id);
    setIsSlugManuallyEdited(true);
  };

  const handleDeleteProject = (row: { id: number }) => {
    if (typeof row.id !== "number") return;
    setDeleteTargetId(row.id);
    setDeleteModalOpen(true);
  };

  const handleDeleteModalToggle = (value: boolean) => {
    setDeleteModalOpen(value);
    if (!value) {
      setDeleteTargetId(null);
    }
  };

  const handleDeletedProject = async () => {
    if (deleteTargetId == null) {
      setDeleteModalOpen(false);
      return;
    }
    if (isEditing && editingProjectId === deleteTargetId) {
      handleCancelEdit();
    }
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    await loadProjects();
  };

  const onSubmitProject = async (data: ProjetoBasicFormValues) => {
    try {
      setLoading(true);
      setAlert({ show: false });
      if (isEditing && typeof editingProjectId === "number") {
        await updateProject(editingProjectId, data);
        setAlert({
          show: true,
          category: "success",
          title: "Projeto atualizado com sucesso.",
        });
      } else {
        await createProject(data);
        setAlert({
          show: true,
          category: "success",
          title: "Projeto cadastrado com sucesso.",
        });
      }
      await loadProjects();
      handleCancelEdit();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      const message =
        (error as { message?: string })?.message || "Erro ao salvar projeto.";
      setAlert({ show: true, category: "error", title: message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout titulo="Cadastro de Projetos">
      {alert.show && (
        <CustomAlert
          category={alert.category}
          title={alert.title ?? ""}
          onClose={() => setAlert({ show: false })}
        />
      )}
      <ModalProjectDelete
        openModal={deleteModalOpen}
        setOpenModal={handleDeleteModalToggle}
        idProject={deleteTargetId ?? 0}
        onDeleted={() => {
          setAlert({
            show: true,
            category: "success",
            title: "Projeto deletado com sucesso.",
          });
          handleDeletedProject();
        }}
        onError={(message) =>
          setAlert({ show: true, category: "error", title: message })
        }
      />
      <Box className={styles.container}>
        <ExpandableCard
          title="Cadastro de Projetos"
          expanded={expanded}
          onToggle={(next) => setExpanded(next)}
          className={styles.card}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmitProject)}
            className={styles.formContainer}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 0, textAlign: "center", pb: "0.9rem" }}
            >
              {isEditing ? "Editar Projeto" : "Dados do Projeto"}
            </Typography>
            <Forms
              inputsList={getProjetoBasicInputs(userOptions)}
              control={control}
              errors={errors}
              onInputChange={(name, value) => {
                if (name === "slug") {
                  const nextValue = String(value ?? "");
                  if (nextValue === "") {
                    setIsSlugManuallyEdited(false);
                    return;
                  }
                  setIsSlugManuallyEdited(nextValue !== generatedSlug);
                }
              }}
            />
            <Box sx={{ mt: 2 }} className={styles.bottonContainer}>
              <button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : isEditing ? (
                  "Atualizar"
                ) : (
                  "Cadastrar"
                )}
              </button>
            </Box>
          </Box>
        </ExpandableCard>
        <Box
          className={`${styles.buttonContainer} ${styles.cancelEditAbove} ${
            isEditing ? styles.visible : styles.hidden
          }`}
        >
          <Button
            onClick={handleCancelEdit}
            className={`${styles.buttonContent} ${styles.buttonEdit}`}
            type="button"
          >
            Cancelar edição
          </Button>
        </Box>
        <ExpandableCard
          title="Projetos cadastrados"
          defaultExpanded={false}
          className={`${styles.card} ${isEditing ? styles.cardEditing : ""}`}
        >
          <GenericDataTable
            rows={projectRows}
            columns={columnsProjects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        </ExpandableCard>
      </Box>
    </Layout>
  );
}
