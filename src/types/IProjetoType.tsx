import type User from "./IUserType";

export default interface Projeto {
  id: number;
  name: string;
  state: string;
  logoUrl?: string;
  users?: User[]; 
  createdAt: string;
  updatedAt: string;
}
