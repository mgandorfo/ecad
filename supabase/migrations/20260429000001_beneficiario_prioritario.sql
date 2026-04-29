-- Adiciona flag de prioridade no cadastro do beneficiário.
-- Quando marcado, o atendimento criado para este beneficiário
-- já inicia como prioritário (lógica aplicada na camada de aplicação).
ALTER TABLE beneficiarios
  ADD COLUMN prioritario boolean NOT NULL DEFAULT false;
