-- Adicionar coluna para guardar posição inicial do piloto na edição
ALTER TABLE event_standings
ADD COLUMN initial_position INTEGER;

-- Preencher com a posição atual como inicial (para edições já existentes)
UPDATE event_standings
SET initial_position = final_position
WHERE initial_position IS NULL;

COMMENT ON COLUMN event_standings.initial_position IS 'Posição do piloto no TOP 20 ANTES da edição começar';