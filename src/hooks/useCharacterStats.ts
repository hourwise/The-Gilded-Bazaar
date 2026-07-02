import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CharacterStats {
  race: string | null;
  displayName: string | null;
  persuasionProficiency: number | null;
  haggleModifier: number | null;
  gold: number;
  silver: number;
  copper: number;
  loading: boolean;
}

/**
 * A hook to fetch the current user's character stats and currency from Supabase
 * and calculate a derived 'Haggle Modifier'.
 */
export const useCharacterStats = (): CharacterStats => {
  const [race, setRace] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [persuasionProficiency, setPersuasionProficiency] = useState<number | null>(null);
  const [haggleModifier, setHaggleModifier] = useState<number | null>(null);
  const [gold, setGold] = useState<number>(0);
  const [silver, setSilver] = useState<number>(0);
  const [copper, setCopper] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacterStats = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('race, display_name, persuasion_proficiency, gold, silver, copper')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching character stats:', error.message);
        } else if (data) {
          setRace(data.race);
          setDisplayName(data.display_name);
          setPersuasionProficiency(data.persuasion_proficiency);
          setGold(data.gold || 0);
          setSilver(data.silver || 0);
          setCopper(data.copper || 0);

          // Calculate the Haggle Modifier
          let modifier = data.persuasion_proficiency || 0;
          switch (data.race) {
            case 'Human':
            case 'Half-Elf':
              modifier += 2; // Charisma bonus
              break;
            case 'Dwarf':
              modifier += 1; // Shrewd haggler bonus
              break;
            case 'Half-Orc':
              modifier -= 1; // Intimidation penalty in social checks
              break;
            default:
              break;
          }
          setHaggleModifier(modifier);
        }
      }
      setLoading(false);
    };

    fetchCharacterStats();
  }, []);

  return { race, displayName, persuasionProficiency, haggleModifier, gold, silver, copper, loading };
};
