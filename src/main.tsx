import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startPreloader } from './lib/preloader'

// Arms the entrance staging in index.css. Set here rather than in the CSS
// itself so that if this bundle never loads, [data-entrance] elements stay
// visible instead of leaving a blank page.
document.documentElement.classList.add('js')

// Opens the door preloader drawn by index.html once the page has loaded.
startPreloader()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
