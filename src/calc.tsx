import { useState, useEffect } from 'react';
import axios from 'axios';
import { usePokemon, getDamageMultiplier, natureChart, type Ability } from './context/PokemonContext';

interface Props {
  type: 'my' | 'enemy';
}

interface BaseStats {
  hp: number; attack: number; defense: number;
  specialAttack: number; specialDefense: number; speed: number;
}

export default function Calc({ type }: Props) {
  const {
    pokemons, myPokemonId, enemyPokemonId,
    myLevel, enemyLevel, myIvs, enemyIvs,
    myNature, enemyNature,
    mySelectedMove, enemySelectedMove
  } = usePokemon();
  
  const [gen, setGen] = useState(9); // 세대 선택
  const [result, setResult] = useState<{ min: number; max: number; multiplier: number } | null>(null);
  const [myBaseStats, setMyBaseStats] = useState<BaseStats | null>(null);
  const [enemyBaseStats, setEnemyBaseStats] = useState<BaseStats | null>(null);
  
  useEffect(() => {
    const fetchStats = async (id: number, setter: (stats: BaseStats) => void) => {
      if (!id) return;
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const s = res.data.stats;
        setter({
          hp: s[0].base_stat, attack: s[1].base_stat, defense: s[2].base_stat,
          specialAttack: s[3].base_stat, specialDefense: s[4].base_stat, speed: s[5].base_stat
        });
      } catch (e) { console.error(e); }
    };
    fetchStats(myPokemonId, setMyBaseStats);
    fetchStats(enemyPokemonId, setEnemyBaseStats);
  }, [myPokemonId, enemyPokemonId]);
  
  const getStat = (base: number, iv: number, level: number, nature: string, statKey: string) => {
    let val = Math.floor(((base * 2 + iv) * level) / 100) + (statKey === 'hp' ? level + 10 : 5);
    const n = natureChart[nature];
    if (n.plus === statKey) val = Math.floor(val * 1.1);
    if (n.minus === statKey) val = Math.floor(val * 0.9);
    return val;
  };
  
  const handleCalculate = () => {
    const isMyAttack = type === 'my';
    const attackerData = pokemons.find(p => p.id === (isMyAttack ? myPokemonId : enemyPokemonId));
    const defenderData = pokemons.find(p => p.id === (isMyAttack ? enemyPokemonId : myPokemonId));
    const attackMove = (isMyAttack ? mySelectedMove : enemySelectedMove) as Ability;
    const aBase = isMyAttack ? myBaseStats : enemyBaseStats;
    const dBase = isMyAttack ? enemyBaseStats : myBaseStats;
    
    if (!attackerData || !defenderData || !attackMove || !aBase || !dBase) return;
    
    // [핵심] 기술의 카테고리에 따른 공격/방어 스탯 분기
    // 4세대 이후: 기술별로 물리/특수 고정
    // 3세대 이전: 기술의 '타입'에 따라 물리/특수 결정 (필요 시 gen에 따라 추가 로직 구현 가능)
    const isPhysical = attackMove.category === 'physical';
    
    const aLevel = isMyAttack ? myLevel : enemyLevel;
    const aIvs = isMyAttack ? myIvs : enemyIvs;
    const aNature = isMyAttack ? myNature : enemyNature;
    
    const dIvs = isMyAttack ? enemyIvs : myIvs;
    const dNature = isMyAttack ? enemyNature : myNature;
    const dLevel = isMyAttack ? enemyLevel : myLevel;
    
    // 공격력(A)과 방어력(D) 결정
    const A = isPhysical
      ? getStat(aBase.attack, aIvs.attack, aLevel, aNature, 'attack')
      : getStat(aBase.specialAttack, aIvs.specialAttack, aLevel, aNature, 'specialAttack');
    
    const D = isPhysical
      ? getStat(dBase.defense, dIvs.defense, dLevel, dNature, 'defense')
      : getStat(dBase.specialDefense, dIvs.specialDefense, dLevel, dNature, 'specialDefense');
    
    // 2. 데미지 계산 (5세대 이후 정석 공식)
    let baseDamage = Math.floor(Math.floor(Math.floor(2 * aLevel / 5 + 2) * (attackMove.power || 0) * A / D) / 50) + 2;
    
    // 3. 보정치 (상성, 자속)
    const typeMult = getDamageMultiplier(attackMove.type, defenderData.types);
    const isStab = attackerData.types.includes(attackMove.type);
    
    let finalDamage = Math.floor(baseDamage * (isStab ? 1.5 : 1) * typeMult);
    
    setResult({
      min: Math.floor(finalDamage * 0.85),
      max: finalDamage,
      multiplier: typeMult
    });
  };
  
  return (
    <div style={{
      width: '300px', background: '#1e1e1e', padding: '15px',
      borderRadius: '10px', border: '1px solid #444', marginTop: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, color: '#ffcb05' }}>{type === 'my' ? 'Player -> Enemy' : 'Enemy -> Player'}</h4>
        <select value={gen} onChange={(e) => setGen(Number(e.target.value))} style={{ background: '#333', color: '#fff', fontSize: '12px' }}>
          {[5,6,7,8,9].map(g => <option key={g} value={g}>{g}세대</option>)}
        </select>
      </div>
      
      <button onClick={handleCalculate} style={{ width: '100%', padding: '10px', background: '#ffcb05', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
        데미지 계산
      </button>
      
      {result && (
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4444' }}>
            {result.min} ~ {result.max}
          </div>
          <div style={{ fontSize: '15px', color: '#888' }}>
            ({isMySelectedMove() ? '물리' : '특수'} / x{result.multiplier} 배율)
          </div>
        </div>
      )}
    </div>
  );
  
  // 도우미 함수: 현재 선택된 기술이 물리인지 확인 (UI 표시용)
  function isMySelectedMove() {
    const move = type === 'my' ? mySelectedMove : enemySelectedMove;
    return move?.category === 'physical';
  }
}