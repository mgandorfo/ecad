export type Role = "admin" | "entrevistador" | "recepcionista" | "vigilancia";

export type Perfil = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  criado_em: string;
};

export type Setor = {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
};

export type Servico = {
  id: string;
  codigo: string;
  nome: string;
  setor_id: string;
  ativo: boolean;
};

export type StatusAtendimento = {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  ativo: boolean;
};

export type Beneficiario = {
  id: string;
  nome: string;
  cpf: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep?: string;
  criado_em: string;
  atualizado_em: string;
};

export type Atendimento = {
  id: string;
  beneficiario_id: string;
  setor_id: string;
  servico_id: string;
  status_id: string;
  servidor_id: string | null;
  criado_por: string;
  prioritario: boolean;
  anotacoes: string | null;
  criado_em: string;
  atualizado_em: string;
  assumido_em: string | null;
  concluido_em: string | null;
  beneficiario?: Beneficiario;
  setor?: Setor;
  servico?: Servico;
  status?: StatusAtendimento;
  servidor?: Perfil;
};
