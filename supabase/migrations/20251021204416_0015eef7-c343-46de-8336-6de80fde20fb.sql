-- Limpar base de apostas e resetar pontos dos usuários

-- 1. Deletar todas as apostas
DELETE FROM bets;

-- 2. Resetar pontos de todos os usuários para 1000
UPDATE user_points 
SET points = 1000,
    total_bets = 0,
    total_wins = 0,
    updated_at = now();

-- 3. Opcional: Resetar estatísticas dos pilotos se necessário
-- UPDATE pilots 
-- SET wins = 0,
--     losses = 0,
--     total_races = 0,
--     points = 0,
--     updated_at = now();