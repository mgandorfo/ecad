-- M13: servico_id passa a ser opcional em atendimentos.
-- A Recepcionista escolhe apenas o Setor ao criar o atendimento;
-- o Entrevistador define o Serviço quando assume o atendimento.
-- A FK para public.servicos é mantida — Postgres aceita FK com valor NULL.
ALTER TABLE public.atendimentos
  ALTER COLUMN servico_id DROP NOT NULL;
