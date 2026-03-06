import { usePokemon, type Ivs } from './context/PokemonContext';

export default function IvsInput({ type }: { type: 'my' | 'enemy' }) {
  const { myIvs, setMyIvs, enemyIvs, setEnemyIvs } = usePokemon();
  
  const currentIvs = type === 'my' ? myIvs : enemyIvs;
  const setCurrentIvs = type === 'my' ? setMyIvs : setEnemyIvs;

  const handleChange = (stat: keyof Ivs, value: string) => {
    // 0~31 범위를 벗어나지 않게 제한
    const val = Math.max(0, Math.min(31, Number(value)));
    setCurrentIvs({ ...currentIvs, [stat]: val });
  };

  const stats: (keyof Ivs)[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];

  return (
    <div style={{
      border: '1px solid gray', width: '380px', height: '230px', margin:'0 10px', borderRadius: '10px', padding: '10px'
    }}>
      <div style={{fontSize: '20px', fontWeight: 'bold', color: 'ffcb15', borderBottom: '1px solid gray', paddingBottom: '10px',
        marginBottom: '0'
      }}>
        개체값
      </div>
      <div className='IvsBox' style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '0 10px', paddingTop: '15px'
      }}>
        {stats.map(stat => (
          <div key={stat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0' }}>
            <label style={{
              fontSize: '14px', fontWeight: 'bold', marginBottom: '5px'
            }}>{stat.toUpperCase()}</label>
            <input
              type="number"
              value={currentIvs[stat]}
              onChange={(e) => handleChange(stat, e.target.value)}
              style={{width: '60px', height: '40px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}