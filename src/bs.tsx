import { useState, useEffect } from 'react';
import axios from 'axios';
import { natureChart, usePokemon } from './context/PokemonContext';

interface Props {
  type: 'my' | 'enemy';
}

interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export default function Bs({ type }: Props) {
  // Context에서 필요한 전역 상태들을 가져옵니다.
  const {
    myPokemonId, enemyPokemonId,
    myIvs, enemyIvs,
    myNature, enemyNature,
    myLevel, setMyLevel,
    enemyLevel, setEnemyLevel
  } = usePokemon();
  
  const [baseStats, setBaseStats] = useState<BaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 현재 진영(my/enemy)에 맞는 데이터 선택
  const selectedId = type === 'my' ? myPokemonId : enemyPokemonId;
  const currentIvs = type === 'my' ? myIvs : enemyIvs;
  const currentNature = type === 'my' ? myNature : enemyNature;
  const currentLevel = type === 'my' ? myLevel : enemyLevel;
  const setCurrentLevel = type === 'my' ? setMyLevel : setEnemyLevel;
  
  // 능력치 계산 공식 (레벨과 성격 보정 반영)
  const calcStat = (base: number, iv: number, statKey: string) => {
    if (statKey === "hp") {
      return Math.floor(((base * 2 + iv) * currentLevel) / 100) + currentLevel + 10;
    }
    
    // 기본 수치 계산
    let val = Math.floor(((base * 2 + iv) * currentLevel) / 100) + 5;
    
    // 성격 보정 적용 (natureChart 참조)
    const n = natureChart[currentNature];
    if (n.plus === statKey) val = Math.floor(val * 1.1);
    if (n.minus === statKey) val = Math.floor(val * 0.9);
    
    return val;
  };
  
  useEffect(() => {
    if (!selectedId) return;
    
    const fetchBaseStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${selectedId}`);
        const stats = res.data.stats;
        
        setBaseStats({
          hp: stats[0].base_stat,
          attack: stats[1].base_stat,
          defense: stats[2].base_stat,
          specialAttack: stats[3].base_stat,
          specialDefense: stats[4].base_stat,
          speed: stats[5].base_stat,
        });
      } catch (err) {
        console.error("종족값 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBaseStats();
  }, [selectedId]);
  
  if (loading || !baseStats) return <div style={{ color: '#fff' }}>데이터 로딩 중...</div>;
  
  // 최종 계산된 능력치 객체 (calcStat의 세 번째 인자는 natureChart의 plus/minus 키와 일치해야 함)
  const finalStats = {
    hp: calcStat(baseStats.hp, currentIvs.hp, "hp"),
    attack: calcStat(baseStats.attack, currentIvs.attack, "attack"),
    defense: calcStat(baseStats.defense, currentIvs.defense, "defense"),
    specialAttack: calcStat(baseStats.specialAttack, currentIvs.specialAttack, "specialAttack"),
    specialDefense: calcStat(baseStats.specialDefense, currentIvs.specialDefense, "specialDefense"),
    speed: calcStat(baseStats.speed, currentIvs.speed, "speed"),
  };
  
  return (
    <div style={{
      width: '220px', background: '#1e1e1e', padding: '15px',
      borderRadius: '10px', border: '1px solid #333', marginTop: '10px', color: '#fff',
      marginRight: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', color: '#ffcb05', margin: 0 }}>실제 능력치</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>Lv.</span>
          <input
            type="number"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(Math.min(100, Math.max(1, Number(e.target.value))))}
            style={{
              width: '50px', height: '18px', background: '#2a2a2a', color: '#fff', border: '1px solid #444',
              borderRadius: '3px', fontSize: '12px', textAlign: 'center'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        {Object.entries(finalStats).map(([label, value]) => {
          // 성격 보정에 따른 색상 강조 (상승: 빨강, 하락: 파랑)
          const n = natureChart[currentNature];
          let statColor = '#fff';
          if (n.plus === label) statColor = '#ff4444';
          if (n.minus === label) statColor = '#4488ff';
          
          return (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa', fontSize: '11px', textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontWeight: 'bold', color: statColor }}>{value}</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px' }}>
                <div style={{
                  width: `${Math.min(100, (value / 300) * 100)}%`,
                  height: '100%',
                  background: (n.plus === label ? '#ff4444' : (n.minus === label ? '#4488ff' : '#ffcb05')),
                  borderRadius: '2px'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}