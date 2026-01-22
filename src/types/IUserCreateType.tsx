export interface userCreateType  {
  id?: number;
  email: string;
  password: string;
  name: string;
  profession?: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  projeto: {
    id: number;
  };
};
