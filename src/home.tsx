import { PokemonProvider, usePokemon } from './context/PokemonContext';
import PokemonSelector from './GetNames';
import IvsInput from './ivs';
import './App.css';
import AbilitySelector from "./AbilitySelector.tsx";
import TypeList from "./TypeList.tsx";

// 1. 실제 UI를 담당하는 컴포넌트 (Provider 내부에서 호출됨)
function BattleForm() {
  const { enemyPokemonId, myPokemonId } = usePokemon();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '30px', flexDirection: 'column' }}>
        
        {/* 상대 포켓몬 섹션 */}
        <div className='enemyDiv'>
          <h2 style = {{margin: '0', padding: 0}}>Enemy</h2>
          <div style={{marginBottom: '10px'}}>___________________________________________________________________________</div>
          <div className='selectors'>
            <PokemonSelector type="enemy" />
            <IvsInput type="enemy" />
            {/* 이제 enemyPokemonId가 바뀔 때마다 key가 변하여 강제 리렌더링됩니다 */}
            <AbilitySelector key={`enemy-${enemyPokemonId}`} pokemonId={enemyPokemonId} />
          </div>
          <div className='typeDiv'>
            <TypeList type="enemy" />
          </div>
        </div>
        
        {/* 내 포켓몬 섹션 */}
        <h2>내 포켓몬</h2>
        <div className='myDiv'>
          <h2 style = {{margin: '0', padding: 0}}>Player</h2>
          <div style={{marginBottom: '10px'}}>___________________________________________________________________________</div>
          <div className='selectors'>
            <PokemonSelector type="my" />
            <IvsInput type="my" />
            <AbilitySelector key={`my-${myPokemonId}`} pokemonId={myPokemonId} />
          </div>
          <div className='typeDiv'>
            <TypeList type="my" />
          </div>
        </div>
      
      </div>
    </div>
  );
}

// 2. 최상위 Home 컴포넌트 (Provider로 전체를 감쌈)
function Home() {
  return (
    <PokemonProvider>
      <BattleForm />
    </PokemonProvider>
  );
}

export default Home;