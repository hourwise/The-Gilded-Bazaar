/**
 * Maps shopkeeper race slugs (stored in DB) to their PNG portrait assets.
 * Slugs must match the filenames in src/assets/images/*.shopkeeper.png
 */
export const SHOPKEEPER_IMAGES: Record<string, any> = {
  aasimar:      require('../assets/images/aasimar.shopkeeper.png'),
  dragonborn:   require('../assets/images/dragonborn.shopkeeper.png'),
  drow:         require('../assets/images/drow.shopkeeper.png'),
  gnome:        require('../assets/images/gnome.shopkeeper.png'),
  halfling:     require('../assets/images/halfling.shopkeeper.png'),
  highelf:      require('../assets/images/highelf.shopkeeper.png'),
  hilldwarf:    require('../assets/images/hilldwarf.shopkeeper.png'),
  human:        require('../assets/images/human.shopkeeper.png'),
  kenku:        require('../assets/images/kenku.shopkeeper.png'),
  mountaindwarf:require('../assets/images/mountaindwarf.shopkeeper.png'),
  orc:          require('../assets/images/orc.shopkeeper.png'),
  tabaxi:       require('../assets/images/tabaxi.shopkeeper.png'),
  tiefling:     require('../assets/images/tiefling.shopkeeper.png'),
  tortle:       require('../assets/images/tortle.shopkeeper.png'),
  woodelf:      require('../assets/images/woodelf.shopkeeper.png'),
};

/** Human-readable labels for the DM shop-creation form */
export const SHOPKEEPER_RACES: { label: string; slug: string }[] = [
  { label: 'Human',          slug: 'human' },
  { label: 'High Elf',       slug: 'highelf' },
  { label: 'Wood Elf',       slug: 'woodelf' },
  { label: 'Drow',           slug: 'drow' },
  { label: 'Hill Dwarf',     slug: 'hilldwarf' },
  { label: 'Mountain Dwarf', slug: 'mountaindwarf' },
  { label: 'Halfling',       slug: 'halfling' },
  { label: 'Gnome',          slug: 'gnome' },
  { label: 'Orc',            slug: 'orc' },
  { label: 'Tiefling',       slug: 'tiefling' },
  { label: 'Dragonborn',     slug: 'dragonborn' },
  { label: 'Tabaxi',         slug: 'tabaxi' },
  { label: 'Tortle',         slug: 'tortle' },
  { label: 'Kenku',          slug: 'kenku' },
  { label: 'Aasimar',        slug: 'aasimar' },
];

export function getShopkeeperImage(slug: string | null | undefined): any {
  return SHOPKEEPER_IMAGES[slug ?? 'human'] ?? SHOPKEEPER_IMAGES.human;
}
