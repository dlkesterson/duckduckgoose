import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import DuckGooseGame from './components/DuckGooseGame';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<DuckGooseGame />
	</StrictMode>
);
