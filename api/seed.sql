-- Seed data for development
-- Run after all migrations

-- Sample items for the library
INSERT INTO items_library (name, description, base_price_copper, rarity, category, rules_source, is_homebrew, created_by)
VALUES
  ('Potion of Healing', 'Restores 2d4+2 hit points when consumed.', 500, 'common', 'potion', 'core', false, NULL),
  ('Longsword', 'A versatile blade wielded with one or two hands.', 1500, 'common', 'weapon', 'core', false, NULL),
  ('Chain Mail', 'Heavy armour made of interlocking metal rings.', 7500, 'common', 'armour', 'core', false, NULL),
  ('Spell Scroll (Cure Wounds)', 'A scroll containing the Cure Wounds spell.', 250, 'uncommon', 'scroll', 'core', false, NULL),
  ('Dagger of Venom', 'A poisoned blade that deals extra damage.', 5000, 'rare', 'weapon', 'core', false, NULL),
  ('Wand of Magic Missiles', 'Fires magical projectiles that never miss.', 8000, 'rare', 'wand', 'core', false, NULL),
  ('Bag of Holding', 'Extradimensional bag that holds far more than normal.', 7500, 'uncommon', 'wondrous', 'core', false, NULL),
  ('Cloak of Protection', 'A shimmering cloak that grants a bonus to AC and saving throws.', 1000, 'uncommon', 'wondrous', 'core', false, NULL),
  ('Rope of Climbing', '50 feet of rope that can animate and climb on command.', 3000, 'uncommon', 'tool', 'core', false, NULL),
  ('Tent', 'A durable two-person tent for resting outdoors.', 200, 'common', 'equipment', 'core', false, NULL);

-- Sample town / settlement
INSERT INTO settlements (campaign_id, name, description, prosperity, danger, magic_density, current_event, status)
SELECT id, 'Westhaven', 'A bustling trade town on the coast, known for its market and shipyard.', 4, 2, 3, 'Festival of the Sun King', 'normal'
FROM campaigns WHERE join_code = 'WESTVN' LIMIT 1;