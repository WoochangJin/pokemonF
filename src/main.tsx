import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PokemonSelector from './GetNames.tsx'
import Home from './home.tsx'
import { PokemonProvider } from './context/PokemonContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PokemonProvider>
      <Home/>
    </PokemonProvider>
  </StrictMode>,
)
