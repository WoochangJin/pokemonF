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

  // 1. 바깥쪽 클릭 감지를 위한 Ref 생성
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = pokemons.filter(p => 
    p.koName.includes(inputText) || p.id.toString().includes(inputText)
  );

  // 2. 바깥쪽 클릭 시 닫기 로직
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
      // 1. 엔터 키를 눌렀고, 검색 결과(filtered)가 있을 때만 실행
      if (e.key === 'Enter' && filtered.length > 0) {
        const firstPokemon = filtered[0];
        setSelectedId(firstPokemon.id);
        setInputText(firstPokemon.koName);
        setIsOpen(false);
        
        // 선택 후 입력창 포커스를 해제하고 싶다면 추가
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    // 2. 이벤트 등록
    document.addEventListener('keydown', handleEnter);
    
    // 3. 의존성 배열에 필요한 상태들을 넣어줍니다.
    // 이 값들이 변할 때마다 리스너가 최신 값을 참조할 수 있게 재등록됩니다.
    return () => {
      document.removeEventListener('keydown', handleEnter);
    };
  }, [filtered, setSelectedId, setInputText, setIsOpen]);

  if (loading) return <div>로딩 중...</div>;

  return (
    // 3. 최상위 div에 ref 연결
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', position: 'relative' }}>
      
      {/* 이미지 카드 */}
      <div style={{ 
        width: '200px', height: '200px', 
        border: '1px solid #ddd', borderRadius: '10px',
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
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setInputText(e.target.value);
            setIsOpen(true);
          }}
          style={{ 
            padding: '10px', 
            borderRadius: '5px', 
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#1e1e1e', // 배경색 적용
            color: '#fff'              // 글자색 적용
          }}
        />

        {/* 2. 검색 결과 리스트 (div 구조 반영) */}
        {isOpen && inputText !== "" && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #333',
            borderRadius: '0 0 5px 5px',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
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
                    borderBottom: '1px solid #333',
                    fontSize: '16px',
                    textAlign: 'left',
                    background: '#1e1e1e',
                    color: '#fff' // 텍스트가 잘 보이도록 흰색 설정
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e1e1e'}
                >
                  <span style={{ color: '#ffcb05', marginRight: '5px' }}>No.{p.id}</span> {p.koName}
                </div>
              ))
            ) : (
              <div style={{ padding: '10px', color: '#999', background: '#1e1e1e' }}>결과가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}