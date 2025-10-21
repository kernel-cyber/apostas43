-- ETAPA 1: Limpeza Total do Banco de Dados
-- Deletar todas as apostas
DELETE FROM bets;

-- Deletar todos os matches
DELETE FROM matches;

-- Deletar todos os event_standings
DELETE FROM event_standings;

-- Resetar estatísticas dos pilotos
UPDATE pilots
SET wins = 0,
    losses = 0,
    total_races = 0,
    points = 0,
    updated_at = now();

-- Resetar pontos dos usuários
UPDATE user_points
SET points = 1000,
    total_bets = 0,
    total_wins = 0,
    updated_at = now();

-- Desativar todos os eventos
UPDATE events
SET is_active = false,
    updated_at = now();

-- ETAPA 2: Adicionar Colunas de Posição Histórica
ALTER TABLE matches
ADD COLUMN pilot1_position integer,
ADD COLUMN pilot2_position integer;

COMMENT ON COLUMN matches.pilot1_position IS 'Posição do pilot1 no TOP 20 no momento da criação do match';
COMMENT ON COLUMN matches.pilot2_position IS 'Posição do pilot2 no TOP 20 no momento da criação do match';