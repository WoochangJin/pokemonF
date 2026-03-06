import { useState, useEffect, useRef } from 'react';
import { usePokemon } from './context/PokemonContext';

interface Props {
  type: 'my' | 'enemy';
}

export default function PokemonSelector({ type }: Props) {
  const { pokemons, myPokemonId, setMyPokemonId, enemyPokemonId, setEnemyPokemonId, loading } = usePokemon();
  
  const isMy = type === 'my';
  const selectedId = isMy ? myPokemonId : enemyPokemonId;
  const setSelectedId = isMy ? setMyPokemonId : setEnemyPokemonId;
  
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // [수정] 검색어가 없으면 ID 순서대로 전체 노출, 검색어가 있으면 필터링
  // pokemons 데이터는 이미 ID 순서로 정렬되어 있다고 가정합니다.
  const filtered = pokemons.filter(p =>
    p.koName.includes(inputText) || p.id.toString().includes(inputText)
  );
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && filtered.length > 0 && isOpen) {
        const firstPokemon = filtered[0];
        setSelectedId(firstPokemon.id);
        setInputText(firstPokemon.koName);
        setIsOpen(false);
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    
    document.addEventListener('keydown', handleEnter);
    return () => {
      document.removeEventListener('keydown', handleEnter);
    };
  }, [filtered, setSelectedId, setInputText, setIsOpen, isOpen]);
  
  if (loading) return <div style={{ color: '#fff' }}>로딩 중...</div>;
  
  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', position: 'relative' }}>
      
      {/* 이미지 카드 */}
      <div style={{
        width: '200px', height: '200px',
        border: '1px solid #333', borderRadius: '10px',
        backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedId}.png`}
          alt="pokemon"
          style={{ width: '90%', height: '90%', objectFit: 'contain' }}
        />
      </div>
      
      {/* 커스텀 검색창 영역 */}
      <div style={{ width: '180px', position: 'relative' }}>
        <input
          type="text"
          placeholder="이름/번호 검색"
          value={inputText}
          onFocus={() => {
            setIsOpen(true);
            // [수정] 클릭 시 입력창을 비워 전체 리스트가 바로 보이게 함
            setInputText("");
          }}
          onChange={(e) => {
            setInputText(e.target.value);
            setIsOpen(true);
          }}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #333',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#1e1e1e',
            color: '#fff',
            outline: 'none'
          }}
        />
        
        {/* [수정] inputText !== "" 조건을 제거하여 클릭만 해도 리스트가 뜨게 함 */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #333',
            borderTop: 'none',
            borderRadius: '0 0 5px 5px',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
            background: '#1e1e1e',
          }}>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <div
                  className='searchLi'
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setInputText(p.koName);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #2a2a2a',
                    fontSize: '14px',
                    textAlign: 'left',
                    background: '#1e1e1e',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e1e1e'}
                >
                  <span style={{ color: '#ffcb05', marginRight: '8px', fontWeight: 'bold', minWidth: '45px' }}>
                    No.{p.id}
                  </span>
                  {p.koName}
                </div>
              ))
            ) : (
              <div style={{ padding: '10px', color: '#666', background: '#1e1e1e', textAlign: 'center' }}>
                결과가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}