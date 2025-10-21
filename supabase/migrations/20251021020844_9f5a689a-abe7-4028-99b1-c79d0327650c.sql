-- Adicionar campo team na tabela pilots
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS team TEXT;

-- Remover todos os pilotos existentes
DELETE FROM pilots;

-- Inserir os 20 novos pilotos na ordem correta (posição 1-20)
INSERT INTO pilots (name, car_name, team, position, category, wins, losses, total_races, points) VALUES
('Malassise', 'Saveiro 4x4 Hulk', 'Dragster Motorsport', 1, 'top20', 0, 0, 0, 0),
('Chavinsky', 'Gol 4x4 217', 'Dragster Motorsport', 2, 'top20', 0, 0, 0, 0),
('Vini Brunini', 'Gol FLD Laranja', 'Grilo Motorsport', 3, 'top20', 0, 0, 0, 0),
('Calegare', 'Gol 4x4 Minion', 'Batistella Motores', 4, 'top20', 0, 0, 0, 0),
('Bruno Piruka', 'Gol 4x4 Cinza', 'Ferrari Motorsport', 5, 'top20', 0, 0, 0, 0),
('Diego Faustino', 'Gol 4x4 Black', 'Carros Motorsport', 6, 'top20', 0, 0, 0, 0),
('Eduardo Pressão', 'Voyage', 'Tanquinho Auto Mecânica', 7, 'top20', 0, 0, 0, 0),
('Igor Silvestre', 'Parati Branca', 'Aliança Motorsport', 8, 'top20', 0, 0, 0, 0),
('Hudema', 'Opala Carbon', 'Equipe 100 Gas', 9, 'top20', 0, 0, 0, 0),
('Fábio Marques', 'Audi RS3', 'Atomic Motorsport', 10, 'top20', 0, 0, 0, 0),
('Malçon', 'Cobalt Turbo', 'Carros Motorsport', 11, 'top20', 0, 0, 0, 0),
('Vinicius Marcelino', 'Chevette', 'Aliança Motorsport', 12, 'top20', 0, 0, 0, 0),
('Gleocar', 'Gol 3x4', 'Mecânica Gleocar', 13, 'top20', 0, 0, 0, 0),
('Nilo Caio', 'Tátiço Cinza', 'Motorsport 14', 14, 'top20', 0, 0, 0, 0),
('Ana Paula', 'Gol Maravilha', 'Motorsport 15', 15, 'top20', 0, 0, 0, 0),
('Tito Constantino', 'Gol Caixa Zumbi', 'Lacerda Garage', 16, 'top20', 0, 0, 0, 0),
('Anderson Sistema', 'Gol Bola', 'Sistema Motorsport', 17, 'top20', 0, 0, 0, 0),
('Joce Mahnic', 'Amarok V6', 'Paladino Racing', 18, 'top20', 0, 0, 0, 0),
('A Definir', 'Não definido', 'A Definir', 19, 'top20', 0, 0, 0, 0),
('A Definir', 'Não definido', 'A Definir', 20, 'top20', 0, 0, 0, 0);