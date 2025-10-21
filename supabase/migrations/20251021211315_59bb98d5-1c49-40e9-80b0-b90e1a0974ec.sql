-- Resetar estatísticas de todos os pilotos

UPDATE pilots 
SET wins = 0,
    losses = 0,
    total_races = 0,
    updated_at = now();