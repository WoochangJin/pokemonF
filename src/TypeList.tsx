import { usePokemon } from './context/PokemonContext';
import { typeChart } from './context/PokemonContext'; // 상성표 파일

export default function TypeList({ type }: { type: 'my' | 'enemy' }) {
  const { pokemons, myPokemonId, enemyPokemonId } = usePokemon();
  
  const selectedId = type === 'my' ? myPokemonId : enemyPokemonId;
  const currentPokemon = pokemons.find(p => p.id === selectedId);
  
  // 데이터가 없거나 타입 정보가 없으면 로딩 처리
  if (!currentPokemon || !currentPokemon.types || currentPokemon.types.length === 0) {
    return <div style={{ color: '#666', fontSize: '12px' }}>타입 정보 로딩 중...</div>;
  }
  
  const targetTypes = currentPokemon.types;
  
  // 18개 공격 타입에 대해 방어 배율 계산
  const effectiveness: Record<number, string[]> = {
    4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: []
  };
  
  Object.keys(typeChart).forEach((attackType) => {
    let multiplier = 1;
    targetTypes.forEach((defType) => {
      const row = typeChart[attackType];
      multiplier *= (row[defType.toLowerCase()] ?? 1);
    });
    
    if (effectiveness[multiplier] !== undefined) {
      effectiveness[multiplier].push(attackType);
    }
  });
  
  const renderSection = (label: string, types: string[], color: string) => {
    if (types.length === 0) return null;
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', color: color, fontWeight: 'bold', marginBottom: '4px' }}>{label}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {types.map(t => (
            <div key={t} style={{
              padding: '2px 6px', borderRadius: '3px', background: '#2a2a2a',
              fontSize: '10px', color: '#fff', border: `1px solid ${color}`, textTransform: 'uppercase'
              
            }}>
              <img
                src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${t}.svg`}
                style={{width:'20px', height:'20px'}}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div style={{
      width: '180px', background: '#1e1e1e', padding: '12px',
      borderRadius: '8px', border: '1px solid #333', marginTop: '10px', textAlign: 'center',
      color: '#ffcb05', fontWeight: 'bold'
    }}>
      <div>상성</div>
      {renderSection("4배", effectiveness[4], "#ff4444")}
      {renderSection("2배", effectiveness[2], "#ff8800")}
      {renderSection("0.5배", effectiveness[0.5], "#00ccff")}
      {renderSection("0.25배", effectiveness[0.25], "#00ff88")}
      {renderSection("무효", effectiveness[0], "#888")}
    </div>
  );
}