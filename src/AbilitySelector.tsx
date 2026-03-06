import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { type Ability, usePokemon, natureChart } from "./context/PokemonContext.tsx";

interface Props {
  pokemonId: number;
  type: 'my' | 'enemy';
}

const moveCache = new Map<number, Ability[]>();

export default function AbilitySelector({ pokemonId, type }: Props) {
  // 1. Context에서 진영별 상태 및 수정 함수 가져오기
  const {
    myNature, setMyNature,
    enemyNature, setEnemyNature,
    mySelectedMove, setMySelectedMove,
    enemySelectedMove, setEnemySelectedMove
  } = usePokemon();
  
  const nature = type === 'my' ? myNature : enemyNature;
  const setNature = type === 'my' ? setMyNature : setEnemyNature;
  
  // 현재 진영에 맞는 전역 상태와 세터(Setter) 연결
  const selectedMove = type === 'my' ? mySelectedMove : enemySelectedMove;
  const setSelectedMove = type === 'my' ? setMySelectedMove : setEnemySelectedMove;
  
  const [allPossibleMoves, setAllPossibleMoves] = useState<Ability[]>([]);
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setAllPossibleMoves([]);
    setSelectedMove(null);
    setInputText("");
    setIsOpen(false);
    
    if (!pokemonId) return;
    
    const fetchAllMoves = async () => {
      if (moveCache.has(pokemonId)) {
        setAllPossibleMoves(moveCache.get(pokemonId)!);
        return;
      }
      
      setLoading(true);
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const moveList = res.data.moves;
        
        const details = await Promise.all(
          moveList.slice(0, 15).map(async (m: any) => {
            try {
              const detailRes = await axios.get(m.move.url);
              const koName = detailRes.data.names.find(
                (n: any) => n.language.name === 'ko'
              )?.name || m.move.name;
              
              return {
                name: koName,
                enName: m.move.name,
                power: detailRes.data.power,
                type: detailRes.data.type.name,
                url: m.move.url,
                // [수정] Calc.tsx의 TS2339 에러를 해결하기 위해 category 필드에 데이터 매핑
                category: detailRes.data.damage_class.name
              };
            } catch (e) {
              return null;
            }
          })
        );
        
        const validMoves = details.filter((d): d is Ability => d !== null);
        moveCache.set(pokemonId, validMoves);
        setAllPossibleMoves(validMoves);
      } catch (err) {
        console.error("기술 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllMoves();
  }, [pokemonId, setSelectedMove]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelectMove = (move: Ability) => {
    // [수정] 전달받은 setSelectedMove(setMySelectedMove 또는 setEnemySelectedMove)를 호출
    setSelectedMove(move);
    setInputText(move.name);
    setIsOpen(false);
  };
  
  const filtered = allPossibleMoves.filter(m =>
    m.name.includes(inputText) || m.enName.toLowerCase().includes(inputText.toLowerCase())
  );
  
  return (
    <div ref={containerRef} style={{
      width: '180px', position: 'relative', marginTop: '5px', display: 'inline-block', textAlign: 'left',
      border: '2px solid #444', padding: '5px', borderRadius: '10px'
    }}>
      <div style={{textAlign: 'center', fontWeight: 'bold', fontSize: '20px'}}>기술</div>
      <input
        type="text"
        placeholder={loading ? "로딩 중..." : "기술 선택..."}
        value={inputText}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setInputText(e.target.value);
          setIsOpen(true);
        }}
        style={{
          width: '100%', height: '50px', padding: '10px', borderRadius: '5px',
          background: '#1e1e1e', color: '#fff', border: '1px solid #333',
          boxSizing: 'border-box', fontSize: '13px', outline: 'none'
        }}
        disabled={loading}
      />
      
      {isOpen && !loading && (
        <div style={{
          position: 'absolute', top: '87px', left: 0, right: 0,
          maxHeight: '180px', overflowY: 'auto', background: '#1e1e1e',
          border: '1px solid #333', borderTop: 'none', zIndex: 9999,
          borderRadius: '0 0 5px 5px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
          {filtered.map((m, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectMove(m)}
              style={{
                padding: '10px', cursor: 'pointer', borderBottom: '1px solid #2a2a2a',
                color: '#fff', fontSize: '13px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${m.type}.svg`}
                  alt={m.type}
                  style={{ width: '20px', height: '20px', padding: '5px', border : '1px solid #2a2a2a', borderRadius: '5px' }}
                />
                <span>{m.name}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold' }}>
                {m.power ? `P:${m.power}` : '-'}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {selectedMove && !isOpen && (
        <div style={{ marginTop: '10px', fontSize: '18px', color: '#ffcb05', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'rgba(255, 203, 5, 0.05)', padding: '5px', borderRadius: '5px' }}>
          <img
            src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${selectedMove.type}.svg`}
            style={{ width: '22px', height: '22px' }}
            alt="type"
          />
          <span style={{ fontWeight: 'bold' }}>위력: {selectedMove.power || '-'}</span>
        </div>
      )}
      
      <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>성격</div>
        <select
          value={nature}
          onChange={(e) => setNature(e.target.value)}
          style={{
            width: '100%', height: '40px', background: '#1e1e1e', color: '#fff',
            border: '1px solid #333', borderRadius: '5px', padding: '0 10px'
          }}
        >
          {Object.entries(natureChart).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name} {value.plus ? `(+${value.plus.slice(0,3)})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}