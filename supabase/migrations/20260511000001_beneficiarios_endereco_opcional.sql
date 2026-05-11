-- M13: torna todos os campos de endereço opcionais no cadastro de beneficiários
-- Apenas nome e CPF continuam obrigatórios.
ALTER TABLE public.beneficiarios
  ALTER COLUMN logradouro DROP NOT NULL,
  ALTER COLUMN numero     DROP NOT NULL,
  ALTER COLUMN bairro     DROP NOT NULL,
  ALTER COLUMN cidade     DROP NOT NULL,
  ALTER COLUMN uf         DROP NOT NULL;
-- Os defaults 'Caarapó' e 'MS' nas colunas cidade/uf são removidos pois agora
-- o campo pode ficar realmente vazio quando não informado.
ALTER TABLE public.beneficiarios
  ALTER COLUMN cidade DROP DEFAULT,
  ALTER COLUMN uf     DROP DEFAULT;
