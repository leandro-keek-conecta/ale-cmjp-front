import type User from "./IUserType";

export default interface Projeto {
  id: number;
  name: string;
  state: string;
  logoUrl?: string;
  slug?: string;
  users?: User[]; 
  createdAt: string;
  updatedAt: string;
}

export interface ProjetoBasicFormValues {
  slug: string;
  name: string;
  cliente?: string;
  descricaoCurta?: string;
  reportId?: string;
  groupId?: string;
  corHex?: string;
  logoUrl?: string;
  ativo: boolean;
}
