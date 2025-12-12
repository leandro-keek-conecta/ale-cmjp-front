export type Campanha = "Sim" | "Não" | "";

export type Genero =
  | "Feminino"
  | "Masculino"
  | "Transgênero"
  | "Não-Binário"
  | "Outros"
  | "Prefiro não responder"
  | "";

export type FormValues = {
  id: string;
  horario: string;
  nome: string;
  telefone: string;
  ano_nascimento: string;
  genero: Genero;
  bairro: string;
  campanha: Campanha;
};
