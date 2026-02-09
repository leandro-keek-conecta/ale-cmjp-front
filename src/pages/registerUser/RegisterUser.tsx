import { Layout } from "@/components/layout/Layout";
import styles from "./RegisterUser.module.css";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import Forms, { type InputType } from "@/components/Forms";
import {
  getUserInputs,
  levelAccessOptions,
  type SelectOption,
} from "./inputs/userInput";
import { useEffect, useMemo, useState } from "react";
import { useForm, type Path } from "react-hook-form";
import type { ProjetoAccessLevel } from "@/types/IUserType";
import CardGrid from "../../components/card-grid";
import { ClimaIcon } from "../../icons/Filter";
import { ArrowDown } from "../../icons/arrowDonw";
import { GenericDataTable } from "@/components/DataTable";
import { columnsUsers } from "./colunsOfUsers/colunsUserData";
import { useAuth } from "@/context/AuthContext";

export type ProjetoFormValue = {
  projetoId: number | null;
  access: ProjetoAccessLevel | null;
  hiddenTabs?: string[];
};

export type FormValues = {
  id?: number;
  projetos: ProjetoFormValue[];
  name: string;
  email: string;
  gender: string;
  profession: string;
  password?: string;
  passwordConfirm?: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
};

const buildDefaultValues = (): FormValues => ({
  id: undefined,
  projetos: [createEmptyProjetoSelection()],
  name: "",
  email: "",
  gender: "",
  profession: "",
  role: "USER",
  password: "",
  passwordConfirm: "",
});

const createEmptyProjetoSelection = (): ProjetoFormValue => ({
  projetoId: null,
  access: null,
  hiddenTabs: [],
});

const buildProjectInputs = (
  index: number,
  projectOptions: SelectOption<number>[],
): InputType<FormValues>[] => [
  {
    name: `projetos.${index}.projetoId` as Path<FormValues>,
    title: `Projeto ${index + 1}`,
    placeholder: "Selecione o projeto",
    type: "Select",
    colSpan: 6,
    selectOptions: projectOptions,
    rules: { required: "Projeto e obrigatorio" },
  },
  {
    name: `projetos.${index}.access` as Path<FormValues>,
    title: "Nivel de acesso",
    placeholder: "Selecione o nivel",
    type: "Select",
    colSpan: 6,
    selectOptions: levelAccessOptions,
    rules: { required: "Nivel de acesso e obrigatorio" },
  },
];

export default function RegisterUser() {
  const { user } = useAuth();
  const {
    control,
    formState: { errors },
    reset: resetEdit,
    handleSubmit: handleCreate,
    getValues,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: buildDefaultValues(),
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState<FormValues[]>([]);
  const [userFormExpanded, setUserFormExpanded] = useState(true);
  const [tableExpanded, setTableExpanded] = useState(false);

  const projectOptions = useMemo<SelectOption<number>[]>(() => {
    const options: SelectOption<number>[] = [];
    const seen = new Set<number>();
    const projects = Array.isArray(user?.projetos) ? user.projetos : [];
    projects.forEach((project) => {
      const id = project.projetoId ?? project.projeto?.id;
      if (typeof id !== "number" || seen.has(id)) return;
      const label =
        project.projeto?.name && project.projeto.name.trim()
          ? project.projeto.name
          : `Projeto ${id}`;
      options.push({ label, value: id });
      seen.add(id);
    });
    return options;
  }, [user]);

  const projetos = watch("projetos");

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const tableRows = useMemo(() => {
    const optionsById = new Map(
      projectOptions.map((option) => [option.value, option.label]),
    );

    return users.map((userEntry, index) => {
      const projectNames =
        userEntry.projetos
          ?.map((project) => {
            if (typeof project.projetoId !== "number") return null;
            return (
              optionsById.get(project.projetoId) ??
              `Projeto ${project.projetoId}`
            );
          })
          .filter(Boolean)
          .join(", ") || "-";

      return {
        id: userEntry.id ?? index + 1,
        name: userEntry.name,
        email: userEntry.email,
        projectNames,
        role: userEntry.role,
      };
    });
  }, [users, projectOptions]);

  function handlerCancelEdit() {
    resetEdit(buildDefaultValues());
    setIsEditing(false);
  }

  const handleAddProject = () => {
    const current = getValues("projetos");
    const next = Array.isArray(current) ? [...current] : [];
    next.push(createEmptyProjetoSelection());
    setValue("projetos", next, { shouldDirty: true, shouldValidate: true });
  };

  const handleRemoveProject = (index: number) => {
    const current = getValues("projetos");
    if (!Array.isArray(current) || current.length <= 1) return;
    const next = current.filter((_, idx) => idx !== index);
    setValue("projetos", next, { shouldDirty: true, shouldValidate: true });
  };

  const handleEditUser = (row: { id: number }) => {
    const selected = users.find((userEntry) => userEntry.id === row.id);
    if (!selected) return;

    resetEdit({
      ...buildDefaultValues(),
      ...selected,
      projetos:
        selected.projetos && selected.projetos.length
          ? selected.projetos
          : [createEmptyProjetoSelection()],
      password: "",
      passwordConfirm: "",
    });
    setIsEditing(true);
    setUserFormExpanded(true);
  };

  const handleDeleteUser = (row: { id: number }) => {
    setUsers((prev) => prev.filter((userEntry) => userEntry.id !== row.id));
    if (isEditing && getValues("id") === row.id) {
      handlerCancelEdit();
    }
  };

  const onSubmitUser = (data: FormValues) => {
    setLoading(true);
    const resolvedId = typeof data.id === "number" ? data.id : Date.now();
    const normalized: FormValues = {
      ...data,
      id: resolvedId,
      projetos:
        Array.isArray(data.projetos) && data.projetos.length
          ? data.projetos.map((project) => ({
              projetoId:
                typeof project.projetoId === "number" ? project.projetoId : null,
              access: project.access ?? null,
              hiddenTabs: project.hiddenTabs ?? [],
            }))
          : [createEmptyProjetoSelection()],
    };

    setUsers((prev) => {
      if (isEditing) {
        return prev.map((userEntry) =>
          userEntry.id === resolvedId ? normalized : userEntry,
        );
      }
      return [normalized, ...prev];
    });

    setLoading(false);
    resetEdit(buildDefaultValues());
    setIsEditing(false);
  };

  const projectSelections = Array.isArray(projetos) ? projetos : [];

  return (
    <Layout>
      <Box className={styles.container}>
        <CardGrid
          className={`${styles.searchCard} ${styles.reveal}`}
          span={12}
          data-reveal
          style={{ ["--reveal-delay" as any]: "0.28s" }}
        >
          <Box className={styles.searchContainer}>
            <Box className={styles.headerSearch}>
              <Box className={styles.statHeader}>
                <ClimaIcon />
                <Box>
                  <Box className={styles.statLabel}>Cadastro</Box>
                </Box>
              </Box>
            </Box>
            <Box
              className={styles.toggleButton}
              onClick={() => setUserFormExpanded(!userFormExpanded)}
            >
              <ArrowDown />
            </Box>
          </Box>
          <Box
            component="form"
            onSubmit={handleCreate(onSubmitUser)}
            className={`${styles.filterContainerBody} ${
              userFormExpanded ? styles.expanded : ""
            }`}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 0, textAlign: "center", pb: "0.9rem" }}
            >
              {isEditing ? "Editar Usuário" : "Dados do Usuário"}
            </Typography>
            <Box
              sx={{ mb: 1, textAlign: "center" }}
              className={`${styles.buttonContainer} ${
                isEditing ? styles.visible : styles.hidden
              }`}
            >
              <Button
                onClick={handlerCancelEdit}
                className={styles.buttonContent}
                type="button"
              >
                Cancelar edição
              </Button>
            </Box>
            <Forms
              inputsList={getUserInputs(isEditing)}
              control={control}
              errors={errors}
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
        </CardGrid>

        <CardGrid
          className={`${styles.searchCard} ${styles.reveal}`}
          span={12}
          data-reveal
          style={{ ["--reveal-delay" as any]: "0.36s" }}
        >
          <Box className={styles.searchContainer}>
            <Box className={styles.headerSearch}>
              <Box className={styles.statHeader}>
                <ClimaIcon />
                <Box>
                  <Box className={styles.statLabel}>Usuarios cadastrados</Box>
                </Box>
              </Box>
            </Box>
            <Box
              className={styles.toggleButton}
              onClick={() => setTableExpanded(!tableExpanded)}
            >
              <ArrowDown />
            </Box>
          </Box>
          <Box
            className={`${styles.filterContainerBody} ${
              tableExpanded ? styles.expanded : ""
            }`}
          >
            {tableRows.length ? (
              <GenericDataTable
                rows={tableRows}
                columns={columnsUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                height="auto"
              />
            ) : (
              <Box className={styles.emptyState}>
                Nenhum usuario cadastrado.
              </Box>
            )}
          </Box>
        </CardGrid>
      </Box>
    </Layout>
  );
}
