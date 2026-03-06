import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

// --- 인터페이스 정의 ---
export interface Pokemon {
  id: number;
  koName: string;
  enName: string;
  types: string[];
}

interface PokemonResponse {
  id: number;
  koName: string;
  enName: string;
  type1: string;
  type2: string | null;
}

export interface Ivs {
  hp: number; attack: number; defense: number;
  specialAttack: number; specialDefense: number; speed: number;
}

export interface Ability {
  name: string;
  enName: string;
  power: number | null;
  type: string;
  url: string;
  category: string;
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
  myNature: string;
  setMyNature: (nature: string) => void;
  enemyNature: string;
  setEnemyNature: (nature: string) => void;
  myLevel: number;
  setMyLevel: (level: number) => void;
  enemyLevel: number;
  setEnemyLevel: (level: number) => void;
  // [추가] 진영별 선택된 기술 상태
  mySelectedMove: Ability | null;
  setMySelectedMove: (move: Ability | null) => void;
  enemySelectedMove: Ability | null;
  setEnemySelectedMove: (move: Ability | null) => void;
  loading: boolean;
}

// --- 유틸리티 데이터 및 함수 (기존과 동일) ---
const defaultIvs: Ivs = { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 };

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

// eslint-disable-next-line react-refresh/only-export-components
export const getDamageMultiplier = (moveType: string, targetTypes: string[]): number => {
  return targetTypes.reduce((multiplier, targetType) => {
    const typeRow = typeChart[moveType.toLowerCase()];
    const effectiveness = typeRow ? (typeRow[targetType.toLowerCase()] ?? 1) : 1;
    return multiplier * effectiveness;
  }, 1);
};

// eslint-disable-next-line react-refresh/only-export-components
export const natureChart: Record<string, { plus?: string; minus?: string; name: string }> = {
  hardy: { name: "노력" }, lonely: { plus: "attack", minus: "defense", name: "외로움" }, adamant: { plus: "attack", minus: "specialAttack", name: "고집" }, naughty: { plus: "attack", minus: "specialDefense", name: "개구쟁이" }, brave: { plus: "attack", minus: "speed", name: "용감" }, bold: { plus: "defense", minus: "attack", name: "대담" }, docile: { name: "온순" }, impish: { plus: "defense", minus: "specialAttack", name: "장난꾸러기" }, lax: { plus: "defense", minus: "specialDefense", name: "촐랑" }, relaxed: { plus: "defense", minus: "speed", name: "무사태평" }, modest: { plus: "specialAttack", minus: "attack", name: "조심" }, mild: { plus: "specialAttack", minus: "defense", name: "의젓" }, bashful: { name: "수줍음" }, rash: { plus: "specialAttack", minus: "specialDefense", name: "덜렁" }, quiet: { plus: "specialAttack", minus: "speed", name: "냉정" }, calm: { plus: "specialDefense", minus: "attack", name: "차분" }, gentle: { plus: "specialDefense", minus: "defense", name: "얌전" }, careful: { plus: "specialDefense", minus: "specialAttack", name: "신중" }, quirky: { name: "변덕" }, sassy: { plus: "specialDefense", minus: "speed", name: "건방" }, timid: { plus: "speed", minus: "attack", name: "겁쟁이" }, hasty: { plus: "speed", minus: "defense", name: "성급" }, jolly: { plus: "speed", minus: "specialAttack", name: "명랑" }, naive: { plus: "speed", minus: "specialDefense", name: "천진난만" }, serious: { name: "성실" },
};

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider = ({ children }: { children: ReactNode }) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [myPokemonId, setMyPokemonId] = useState<number>(1);
  const [enemyPokemonId, setEnemyPokemonId] = useState<number>(4);
  const [loading, setLoading] = useState(true);
  const [myIvs, setMyIvs] = useState<Ivs>(defaultIvs);
  const [enemyIvs, setEnemyIvs] = useState<Ivs>(defaultIvs);
  const [myNature, setMyNature] = useState<string>("hardy");
  const [enemyNature, setEnemyNature] = useState<string>("hardy");
  const [myLevel, setMyLevel] = useState<number>(50);
  const [enemyLevel, setEnemyLevel] = useState<number>(50);
  
  // [수정] 진영별 기술 상태를 Provider 내부에서 관리
  const [mySelectedMove, setMySelectedMove] = useState<Ability | null>(null);
  const [enemySelectedMove, setEnemySelectedMove] = useState<Ability | null>(null);
  
  useEffect(() => {
    axios.get<PokemonResponse[]>('https://pokemonb.onrender.com/api/pokemon/names')
      .then(res => {
        const mappedData = res.data.map((p) => ({
          id: p.id,
          koName: p.koName,
          enName: p.enName,
          types: [p.type1, p.type2].filter((t): t is string => t !== null && t !== undefined)
        }));
        setPokemons(mappedData);
        setLoading(false);
      })
  }, []);
  
  return (
    <PokemonContext.Provider value={{
      pokemons,
      myPokemonId, setMyPokemonId,
      enemyPokemonId, setEnemyPokemonId,
      myIvs, setMyIvs,
      enemyIvs, setEnemyIvs,
      myNature, setMyNature,
      enemyNature, setEnemyNature,
      myLevel, setMyLevel,
      enemyLevel, setEnemyLevel,
      // [추가] 벨류 넘겨주기
      mySelectedMove, setMySelectedMove,
      enemySelectedMove, setEnemySelectedMove,
      loading
    }}>
      {children}
    </PokemonContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (!context) throw new Error("usePokemon must be used within a PokemonProvider");
  return context;
};