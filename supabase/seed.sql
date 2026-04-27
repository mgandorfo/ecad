-- Seeds de desenvolvimento — refletem os mocks em lib/mocks/
-- Execute APÓS aplicar todas as migrations.

-- Setores
INSERT INTO public.setores (id, codigo, nome, ativo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'BPC',  'BPC - Benefício de Prestação Continuada', true),
  ('00000000-0000-0000-0000-000000000002', 'CAD',  'CadÚnico - Cadastro Único',               true),
  ('00000000-0000-0000-0000-000000000003', 'PBF',  'Programa Bolsa Família',                  true),
  ('00000000-0000-0000-0000-000000000004', 'CRAS', 'CRAS - Centro de Referência',             true),
  ('00000000-0000-0000-0000-000000000005', 'HBT',  'Habitação',                               false)
ON CONFLICT (codigo) DO NOTHING;

-- Serviços
INSERT INTO public.servicos (id, codigo, nome, setor_id, ativo) VALUES
  ('00000000-0000-0000-0001-000000000001', 'CAD-INC',  'Inclusão no CadÚnico',   '00000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0001-000000000002', 'CAD-ATU',  'Atualização cadastral',   '00000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0001-000000000003', 'CAD-EXC',  'Exclusão de membro',      '00000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0001-000000000004', 'BPC-SOL',  'Solicitação BPC',         '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000005', 'BPC-REV',  'Revisão BPC',             '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000006', 'PBF-CAD',  'Cadastramento PBF',       '00000000-0000-0000-0000-000000000003', true),
  ('00000000-0000-0000-0001-000000000007', 'PBF-DES',  'Desbloqueio PBF',         '00000000-0000-0000-0000-000000000003', true),
  ('00000000-0000-0000-0001-000000000008', 'CRAS-ATD', 'Atendimento CRAS',        '00000000-0000-0000-0000-000000000004', true)
ON CONFLICT (codigo) DO NOTHING;

-- Status de atendimento
INSERT INTO public.status_atendimento (id, nome, cor, ordem, ativo) VALUES
  ('00000000-0000-0000-0002-000000000001', 'Aguardando',               '#f59e0b', 1, true),
  ('00000000-0000-0000-0002-000000000002', 'Em Atendimento',           '#3b82f6', 2, true),
  ('00000000-0000-0000-0002-000000000003', 'Concluído',                '#22c55e', 3, true),
  ('00000000-0000-0000-0002-000000000004', 'Cancelado',                '#ef4444', 4, true),
  ('00000000-0000-0000-0002-000000000005', 'Pendente Documentação',    '#a855f7', 5, true)
ON CONFLICT DO NOTHING;
