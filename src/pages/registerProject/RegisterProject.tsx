import { Layout } from "@/components/layout/Layout";
import { Box } from "@mui/material";
import styles from "./RegisterProject.module.css";
import ExpandableCard from "@/components/expandable-card";

export default function RegisterProject() {
  return (
    <Layout titulo="Cadastro de Projetos">
      <Box className={styles.container}>
        <ExpandableCard title="Cadastro de Projetos" defaultExpanded className={styles.card}>
          <h1>Cadastro de Projetos</h1>
        </ExpandableCard>
        <ExpandableCard title="Projetos cadastrados" defaultExpanded={false}>
          <h1>Projetos cadastrados</h1>
        </ExpandableCard>
      </Box>
    </Layout>
  );
}
