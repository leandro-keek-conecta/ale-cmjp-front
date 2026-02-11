import { Layout } from "@/components/layout/Layout";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import styles from "./RegisterProject.module.css";
import ExpandableCard from "@/components/expandable-card";
import type { ProjetoBasicFormValues } from "@/types/IProjetoType";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import Forms from "@/components/Forms";
import { getProjetoBasicInputs } from "./inputs/projectInput";
import { generateSlug } from "@/utils/generateSlug";
import { fetchUsers } from "@/services/user/userService";
import type User from "@/types/IUserType";

export default function RegisterProject() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userOptions, setUserOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjetoBasicFormValues>({
    defaultValues: {
      ativo: true,
    },
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
              option !== null
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
  return (
    <Layout titulo="Cadastro de Projetos">
      <Box className={styles.container}>
        <ExpandableCard
          title="Cadastro de Projetos"
          defaultExpanded
          className={styles.card}
        >
          <Box className={styles.formContainer}>
              <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 0, textAlign: "center", pb: "0.9rem" }}
            >
              {isEditing ? "Editar Projeto" : "Dados do Projeto"}
            </Typography>
            <Forms
              inputsList={getProjetoBasicInputs(
                userOptions,
                isSlugManuallyEdited
              )}
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
        <ExpandableCard title="Projetos cadastrados" defaultExpanded={false}>
          <h1>Projetos cadastrados</h1>
        </ExpandableCard>
      </Box>
    </Layout>
  );
}
