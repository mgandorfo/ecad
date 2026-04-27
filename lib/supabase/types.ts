// Este arquivo é gerado automaticamente. Não edite manualmente.
// Execute: npm run db:types
// Requer: supabase CLI instalado e autenticado (npx supabase login)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          email: string;
          role: "admin" | "entrevistador" | "recepcionista" | "vigilancia";
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          role?: "admin" | "entrevistador" | "recepcionista" | "vigilancia";
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          role?: "admin" | "entrevistador" | "recepcionista" | "vigilancia";
          ativo?: boolean;
          criado_em?: string;
        };
      };
      setores: {
        Row: {
          id: string;
          codigo: string;
          nome: string;
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          nome: string;
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          nome?: string;
          ativo?: boolean;
          criado_em?: string;
        };
      };
      servicos: {
        Row: {
          id: string;
          codigo: string;
          nome: string;
          setor_id: string;
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          nome: string;
          setor_id: string;
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          nome?: string;
          setor_id?: string;
          ativo?: boolean;
          criado_em?: string;
        };
      };
      status_atendimento: {
        Row: {
          id: string;
          nome: string;
          cor: string;
          ordem: number;
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cor?: string;
          ordem?: number;
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cor?: string;
          ordem?: number;
          ativo?: boolean;
          criado_em?: string;
        };
      };
      beneficiarios: {
        Row: {
          id: string;
          nome: string;
          cpf: string;
          logradouro: string;
          numero: string;
          complemento: string | null;
          bairro: string;
          cidade: string;
          uf: string;
          cep: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cpf: string;
          logradouro: string;
          numero: string;
          complemento?: string | null;
          bairro: string;
          cidade: string;
          uf: string;
          cep?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cpf?: string;
          logradouro?: string;
          numero?: string;
          complemento?: string | null;
          bairro?: string;
          cidade?: string;
          uf?: string;
          cep?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
      atendimentos: {
        Row: {
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
        };
        Insert: {
          id?: string;
          beneficiario_id: string;
          setor_id: string;
          servico_id: string;
          status_id: string;
          servidor_id?: string | null;
          criado_por: string;
          prioritario?: boolean;
          anotacoes?: string | null;
          criado_em?: string;
          atualizado_em?: string;
          assumido_em?: string | null;
          concluido_em?: string | null;
        };
        Update: {
          id?: string;
          beneficiario_id?: string;
          setor_id?: string;
          servico_id?: string;
          status_id?: string;
          servidor_id?: string | null;
          criado_por?: string;
          prioritario?: boolean;
          anotacoes?: string | null;
          criado_em?: string;
          atualizado_em?: string;
          assumido_em?: string | null;
          concluido_em?: string | null;
        };
      };
    };
    Enums: {
      role: "admin" | "entrevistador" | "recepcionista" | "vigilancia";
    };
  };
};
