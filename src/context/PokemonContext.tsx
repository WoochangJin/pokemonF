import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

export interface Pokemon {
  id: number;
  koName: string;
  enName: string;
  types: string[];
}

export interface Ivs {
  hp: number; attack: number; defense: number;
  specialAttack: number; specialDefense: number; speed: number;
}

interface PokemonContextType {
  pokemons: Pokemon[];
  myPokemonId: number;
  setMyPokemonId: (id: number) => void;
  enemyPokemonId: number;
  setEnemyPokemonId: (id: number) => void;
  myIvs: Ivs;
  setMyIvs: (ivs: Ivs) => void;
  enemyIvs: Ivs;
  setEnemyIvs: (ivs: Ivs) => void;
  loading: boolean;
}

const defaultIvs: Ivs = {
  hp: 31, attack: 31, defense: 31,
  specialAttack: 31, specialDefense: 31, speed: 31
};

// 상성표와 배율 함수는 그대로 유지
// eslint-disable-next-line react-refresh/only-export-components
export const typeChart: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export const getDamageMultiplier = (moveType: string, targetTypes: string[]): number => {
  return targetTypes.reduce((multiplier, targetType) => {
    const typeRow = typeChart[moveType.toLowerCase()];
    const effectiveness = typeRow ? (typeRow[targetType.toLowerCase()] ?? 1) : 1;
    return multiplier * effectiveness;
  }, 1);
};

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider = ({ children }: { children: ReactNode }) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [myPokemonId, setMyPokemonId] = useState<number>(1);
  const [enemyPokemonId, setEnemyPokemonId] = useState<number>(4);
  const [loading, setLoading] = useState(true);
  const [myIvs, setMyIvs] = useState<Ivs>(defaultIvs);
  const [enemyIvs, setEnemyIvs] = useState<Ivs>(defaultIvs);
  
  useEffect(() => {
    // [수정] axios 요청 후 데이터를 mappedData로 변환하여 저장
    axios.get('http://localhost:8080/api/pokemon/names')
      .then(res => {
        const mappedData = res.data.map((p: any) => ({
          id: p.id,
          koName: p.koName,
          enName: p.enName,
          // 백엔드 PokemonNameDto의 type1, type2 필드를 배열로 변환
          types: [p.type1, p.type2].filter(t => t !== null && t !== undefined)
        }));
        setPokemons(mappedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("데이터 로드 실패:", err);
        setLoading(false);
      });
  }, []);
  
  return (
    <PokemonContext.Provider value={{
      pokemons,
      myPokemonId, setMyPokemonId,
      enemyPokemonId, setEnemyPokemonId,
      myIvs, setMyIvs,
      enemyIvs, setEnemyIvs,
      loading
    }}>
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (!context) throw new Error("usePokemon must be used within a PokemonProvider");
  return context;
};