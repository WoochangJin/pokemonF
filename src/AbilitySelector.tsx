import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Ability {
  name: string;
  enName: string;
  power: number | null;
  type: string;
  url: string;
}

interface Props {
  pokemonId: number;
}

// 컴포넌트 외부에서 캐시 관리 (리렌더링 시에도 데이터 유지)
const moveCache = new Map<number, Ability[]>();

export default function AbilitySelector({ pokemonId }: Props) {
  const [allPossibleMoves, setAllPossibleMoves] = useState<Ability[]>([]);
  const [selectedMove, setSelectedMove] = useState<Ability | null>(null);
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 1. 초기화: ID가 바뀌는 즉시 이전 데이터를 비웁니다.
    setAllPossibleMoves([]);
    setSelectedMove(null);
    setInputText("");
    setIsOpen(false);
    
    if (!pokemonId) return;
    
    const fetchAllMoves = async () => {
      // 2. 캐시 확인
      if (moveCache.has(pokemonId)) {
        setAllPossibleMoves(moveCache.get(pokemonId)!);
        return;
      }
      
      // 3. API 호출
      setLoading(true);
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const moveList = res.data.moves;
        
        // 상위 15개 기술의 한글 이름과 타입 정보를 병렬로 가져옴
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
                url: m.move.url
              };
            } catch (e) {
              return null;
            }
          })
        );
        
        const validMoves = details.filter((d): d is Ability => d !== null);
        
        // 4. 캐시 저장 및 상태 반영
        moveCache.set(pokemonId, validMoves);
        setAllPossibleMoves(validMoves);
      } catch (err) {
        console.error("기술 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllMoves();
  }, [pokemonId]); // pokemonId 변경을 트리거로 사용
  
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
    setSelectedMove(move);
    setInputText(move.name);
    setIsOpen(false);
  };
  
  const filtered = allPossibleMoves.filter(m =>
    m.name.includes(inputText) || m.enName.toLowerCase().includes(inputText.toLowerCase())
  );
  
  return (
    <div ref={containerRef} style={{ width: '180px', position: 'relative', marginTop: '5px', display: 'inline-block', textAlign: 'left' }}>
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
          width: '100%', height: '40px', padding: '10px', borderRadius: '5px',
          background: '#1e1e1e', color: '#fff', border: '1px solid #333',
          boxSizing: 'border-box', fontSize: '13px', outline: 'none',
          marginTop: '40px'
        }}
        disabled={loading}
      />
      
      {isOpen && !loading && (
        <div style={{
          position: 'absolute', top: '80px', left: 0, right: 0,
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
                  style={{ width: '20px', height: '20px', filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' }}
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
    </div>
  );
}