import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

// 1. 타입 정의
export interface Pokemon {
  id: number;
  koName: string;
  enName: string;
}

export interface Ivs {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface PokemonContextType {
  pokemons: Pokemon[];
  myPokemonId: number;
  setMyPokemonId: (id: number) => void;
  enemyPokemonId: number;
  setEnemyPokemonId: (id: number) => void;
  // IVs 관련 타입 추가
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

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider = ({ children }: { children: ReactNode }) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [myPokemonId, setMyPokemonId] = useState<number>(1);
  const [enemyPokemonId, setEnemyPokemonId] = useState<number>(4);
  const [loading, setLoading] = useState(true);

  // 2. IVs 상태를 컴포넌트 내부로 이동
  const [myIvs, setMyIvs] = useState<Ivs>(defaultIvs);
  const [enemyIvs, setEnemyIvs] = useState<Ivs>(defaultIvs);

  useEffect(() => {
    axios.get<Pokemon[]>('http://localhost:8080/api/pokemon/names')
      .then(res => {
        setPokemons(res.data);
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
      myIvs, setMyIvs,       // 추가
      enemyIvs, setEnemyIvs, // 추가
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