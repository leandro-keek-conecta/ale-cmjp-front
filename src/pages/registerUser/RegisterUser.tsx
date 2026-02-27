import { Layout } from "@/components/layout/Layout";
import styles from "./RegisterUser.module.css";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import Forms from "@/components/Forms";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  getUserInputs,
  levelAccessOptions,
  type SelectOption,
} from "./inputs/userInput";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import type { ProjetoAccessLevel } from "@/types/IUserType";
import type User from "@/types/IUserType";
import CardGrid from "../../components/card-grid";
import { ClimaIcon } from "../../icons/Filter";
import { ArrowDown } from "../../icons/arrowDonw";
import { GenericDataTable } from "@/components/DataTable";
import { columnsUsers } from "./colunsOfUsers/colunsUserData";
import SelectButton from "@/components/selectButtom";
import SelectWithSwitch from "@/components/selectWithSwitch";
import getProjects from "@/services/projeto/ProjetoService";
import type Projeto from "@/types/IProjetoType";
import { createUser, fetchUsers, updateUser } from "@/services/user/userService";
import CustomAlert from "@/components/Alert";
import { ModalUserDelete } from "./modalDelete";

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

type AlertState = {
  show: boolean;
  category?: "success" | "error" | "info" | "warning";
  title?: string;
};

type ProjetoRequestPayload = {
  id: number;
  access: ProjetoAccessLevel;
  hiddenTabs?: string[];
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

const SYSTEM_SCREENS: SelectOption<string>[] = [
  { label: "Panorama", value: "panorama" },
  { label: "Relatório", value: "relatorio" },
  { label: "Relatório de opiniões", value: "Relatório de opiniões" },
  { label: "Cadastro de usuário", value: "cadastro-usuario" },
  { label: "Formulários", value: "form-page" },
  { label: "Formulário dinâmico", value: "form-dinamico" },
];

const normalizeProjetosForRequest = (
  projetos: ProjetoFormValue[] | undefined,
): ProjetoRequestPayload[] => {
  if (!Array.isArray(projetos)) return [];
  const seen = new Set<number>();
  return projetos
    .map((project) => {
      const id = project?.projetoId;
      const access = project?.access ?? null;
      if (typeof id !== "number" || !access) return null;
      if (seen.has(id)) return null;
      seen.add(id);
      return {
        id,
        access,
        hiddenTabs: Array.isArray(project?.hiddenTabs)
          ? project.hiddenTabs
          : [],
      };
    })
    .filter(Boolean) as ProjetoRequestPayload[];
};

const normalizeProjectsPayload = (data: unknown): Projeto[] => {
  if (Array.isArray(data)) return data as Projeto[];
  if (data && typeof data === "object") {
    const candidates = [
      (data as any).data,
      (data as any).items,
      (data as any).rows,
      (data as any).results,
      (data as any).result,
    ];
    const list = candidates.find(Array.isArray);
    return Array.isArray(list) ? (list as Projeto[]) : [];
  }
  return [];
};

const normalizeUsersPayload = (data: unknown): User[] => {
  if (Array.isArray(data)) return data as User[];
  if (data && typeof data === "object") {
    const candidates = [
      (data as any).data,
      (data as any).items,
      (data as any).rows,
      (data as any).results,
      (data as any).result,
    ];
    const list = candidates.find(Array.isArray);
    return Array.isArray(list) ? (list as User[]) : [];
  }
  return [];
};

const mapUserProjects = (user: User): ProjetoFormValue[] => {
  if (Array.isArray(user?.projetos) && user.projetos.length) {
    const mapped = user.projetos
      .map((project) => {
        const id = project?.projetoId ?? project?.projeto?.id;
        if (typeof id !== "number") return null;
        return {
          projetoId: id,
          access: project?.access ?? null,
          hiddenTabs: project?.hiddenTabs ?? [],
        };
      })
      .filter(Boolean) as ProjetoFormValue[];

    return mapped.length ? mapped : [createEmptyProjetoSelection()];
  }

  const fallbackId = user?.projetoId ?? user?.projeto?.id;
  if (typeof fallbackId === "number") {
    return [
      {
        projetoId: fallbackId,
        access: null,
        hiddenTabs: [],
      },
    ];
  }

  return [createEmptyProjetoSelection()];
};

const mapUserToFormValues = (user: User): FormValues => ({
  id: user?.id,
  name: user?.name ?? "",
  email: user?.email ?? "",
  gender: (user as any)?.gender ?? "",
  profession: user?.profession ?? "",
  role: (user?.role as FormValues["role"]) ?? "USER",
  projetos: mapUserProjects(user),
  password: "",
  passwordConfirm: "",
});

export default function RegisterUser() {
  const isMountedRef = useRef(true);
  const {
    control,
    formState: { errors },
    reset: resetEdit,
    handleSubmit: handleCreate,
    getValues,
    setValue,
  } = useForm<FormValues>({
    defaultValues: buildDefaultValues(),
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState<FormValues[]>([]);
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [alert, setAlert] = useState<AlertState>({ show: false });
  const [userFormExpanded, setUserFormExpanded] = useState(true);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projetos",
  });
  const projectOptions = useMemo<SelectOption<number>[]>(() => {
    const options: SelectOption<number>[] = [];
    const seen = new Set<number>();
    projects.forEach((project) => {
      const id = project?.id;
      if (typeof id !== "number" || seen.has(id)) return;
      const label =
        project?.name && project.name.trim() ? project.name : `Projeto ${id}`;
      options.push({ label, value: id });
      seen.add(id);
    });
    return options;
  }, [projects]);

  const validateProjetoDuplicado = useCallback(
    (value: number | null, index: number) => {
      if (typeof value !== "number") {
        return "Selecione um projeto";
      }
      const projetos = getValues("projetos");
      if (!Array.isArray(projetos)) return true;
      const duplicado = projetos.some(
        (item, idx) => idx !== index && item?.projetoId === value,
      );
      return duplicado ? "Projeto ja adicionado" : true;
    },
    [getValues],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetchUsers();
      const list = normalizeUsersPayload(response);
      const mapped = list.map(mapUserToFormValues);
      if (isMountedRef.current) {
        setUsers(mapped);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários.", error);
      if (isMountedRef.current) {
        setUsers([]);
      }
    }
  }, []);

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

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        const list = normalizeProjectsPayload(response);
        if (isMounted) {
          setProjects(list);
        }
      } catch (error) {
        console.error("Erro ao carregar projetos.", error);
        if (isMounted) {
          setProjects([]);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const handleDeletedUser = async () => {
    if (deleteTargetId == null) {
      setDeleteModalOpen(false);
      return;
    }

    if (isEditing && getValues("id") === deleteTargetId) {
      handlerCancelEdit();
    }

    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    setAlert({
      show: true,
      category: "success",
      title: "Usuario deletado com sucesso!",
    });
    await loadUsers();
  };

  const handleRegisterUser = async (data: FormValues) => {
    try {
      setLoading(true);
      setAlert({ show: false });
      const { projetos, ...rest } = data;
      const projetosPayload = normalizeProjetosForRequest(projetos);

      if (projetosPayload.length === 0) {
        throw new Error("Selecione ao menos um projeto e nivel de acesso.");
      }

      const password = rest.password;
      if (!password) {
        throw new Error("Informe uma senha para criar o usuário.");
      }

      await createUser({
        email: rest.email,
        name: rest.name,
        password,
        gender: rest.gender,
        profession: rest.profession,
        role: rest.role,
        projetos: projetosPayload,
      });

      if (isMountedRef.current) {
        setAlert({
          show: true,
          category: "success",
          title: "Usuario cadastrado com sucesso!",
        });
      }

      handlerCancelEdit();
      await loadUsers();
    } catch (error: any) {
      const message = error?.message || "Erro ao cadastrar usuário.";
      if (!isMountedRef.current) return;
      if (
        typeof message === "string" &&
        message.toLowerCase().includes("email") &&
        message.toLowerCase().includes("cadastrado")
      ) {
        setAlert({
          show: true,
          category: "error",
          title: "Erro: e-mail ja cadastrado.",
        });
      } else {
        setAlert({ show: true, category: "error", title: message });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleUpdateUser = async (data: FormValues) => {
    try {
      setLoading(true);
      setAlert({ show: false });
      const { projetos, password, passwordConfirm, ...rest } = data;
      const id = rest.id;
      if (typeof id !== "number") {
        throw new Error("Usuário inválido para atualização.");
      }

      const projetosPayload = normalizeProjetosForRequest(projetos);
      if (projetosPayload.length === 0) {
        throw new Error("Selecione ao menos um projeto e nivel de acesso.");
      }

      await updateUser({
        id,
        email: rest.email,
        name: rest.name,
        role: rest.role,
        profession: rest.profession,
        projetos: projetosPayload,
      });

      if (isMountedRef.current) {
        setAlert({
          show: true,
          category: "success",
          title: "Usuario atualizado com sucesso!",
        });
      }

      handlerCancelEdit();
      await loadUsers();
    } catch (error: any) {
      const message = error?.message || "Erro ao atualizar usuário.";
      if (!isMountedRef.current) return;
      setAlert({ show: true, category: "error", title: message });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const onSubmitUser = async (data: FormValues) => {
    if (!isEditing) {
      await handleRegisterUser(data);
      return;
    }
    await handleUpdateUser(data);
  };

  return (
    <Layout
      titulo="Cadastro de Usuário"
    >
      {alert.show && (
        <CustomAlert
          category={alert.category}
          title={alert.title ?? ""}
          onClose={() => setAlert({ show: false })}
        />
      )}
      <ModalUserDelete
        openModal={deleteModalOpen}
        setOpenModal={handleDeleteModalToggle}
        idUser={deleteTargetId ?? 0}
        onDeleted={handleDeletedUser}
      />
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
            <Forms
              inputsList={getUserInputs(isEditing)}
              control={control}
              errors={errors}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Projetos e níveis de acesso
              </Typography>
              <Stack spacing={2} mt={1}>
                {fields.map((field, index) => (
                  <Stack
                    key={field.id}
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", md: "flex-end" }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name={`projetos.${index}.projetoId`}
                        control={control}
                        rules={{
                          validate: (value) =>
                            validateProjetoDuplicado(value, index),
                        }}
                        render={({ field: campo, fieldState }) => (
                          <SelectButton
                            label="Projeto"
                            placeholder="Selecione um projeto"
                            options={projectOptions}
                            value={campo.value ?? null}
                            onChange={(selected) => {
                              campo.onChange(selected);
                              setValue(`projetos.${index}.hiddenTabs`, []);
                            }}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name={`projetos.${index}.access`}
                        control={control}
                        rules={{ required: "Selecione o nível de acesso" }}
                        render={({ field: campo, fieldState }) => (
                          <SelectButton
                            label="Nível de acesso"
                            placeholder="Escolha uma opção"
                            options={levelAccessOptions}
                            value={campo.value ?? null}
                            onChange={(selected) => campo.onChange(selected)}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name={`projetos.${index}.hiddenTabs`}
                        control={control}
                        render={({ field: campo }) => (
                          <SelectWithSwitch
                            label="Telas do sistema (desmarque para esconder)"
                            options={SYSTEM_SCREENS}
                            value={campo.value ?? []}
                            noOptionsText="Nenhuma tela disponível"
                            onChange={(selected) =>
                              campo.onChange(
                                Array.isArray(selected) ? selected : [],
                              )
                            }
                          />
                        )}
                      />
                    </Box>
                    {fields.length > 1 && (
                      <IconButton
                        type="button"
                        aria-label="Remover projeto"
                        onClick={() => remove(index)}
                        sx={{
                          alignSelf: { xs: "flex-end", md: "center" },
                          mt: { xs: 1, md: 0 },
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => append(createEmptyProjetoSelection())}
                  sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}
                >
                  Adicionar projeto
                </Button>
              </Stack>
            </Box>

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



        <Box
          className={`${styles.buttonContainer} ${styles.cancelEditAbove} ${
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

        <CardGrid
          className={`${styles.searchCard} ${styles.reveal}`}
          span={12}
          data-reveal
          data-editing={isEditing ? "true" : "false"}
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
                Nenhum usuário cadastrado.
              </Box>
            )}
          </Box>
        </CardGrid>
      </Box>
    </Layout>
  );
}

