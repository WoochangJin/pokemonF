import { PokemonProvider } from './context/PokemonContext';
import PokemonSelector from './GetNames';
import IvsInput from './ivs';
import './App.css'

function Home() {
  return (
    <PokemonProvider>
      <div style={{ padding: '40px', textAlign: 'center',  }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '30px', flexDirection: 'column'}}>
          {/* 내 포켓몬 선택기 */}
          <h2>상대 포켓몬</h2>
          <div className='enemyDiv'>
            <PokemonSelector type="enemy" />
            <IvsInput type="enemy" />
          </div>
          
          {/* 상대 포켓몬 선택기 */}
          <h2>내 포켓몬</h2>
          <div className='myDiv'>
            <PokemonSelector type="my" />
            <IvsInput type="my" />
          </div>
        </div>
      </div>
    </PokemonProvider>
  );
}

export default Home;