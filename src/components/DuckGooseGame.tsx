import { useGameLogic } from '../hooks/useGameLogic';
import { ConfettiParticle, PopupMessage, GameAnimal } from './GameElements';
import { PushButton } from './PushButton';

const DuckGooseGame = () => {
	const {
		gameState,
		animals,
		confetti,
		popupTexts,
		chaseMode,
		isResetting,
		duckCount,
		score,
		highScores,
		handleClick,
		isButtonCooldown,
	} = useGameLogic();

	return (
		<div
			className={`h-screen w-screen overflow-hidden relative transition-colors duration-500 ${
				chaseMode ? 'bg-red-50' : 'bg-blue-50'
			} text-black`}>
			{confetti.map((particle) => (
				<ConfettiParticle key={particle.id} particle={particle} />
			))}

			{popupTexts.map((popup) => (
				<PopupMessage key={popup.id} popup={popup} />
			))}

			{animals.map((animal) => (
				<GameAnimal
					key={animal.id}
					animal={animal}
					chaseMode={chaseMode}
					isResetting={isResetting}
				/>
			))}

			<div className='absolute top-4 left-4 space-y-2'>
				<div className='text-lg font-medium'>Ducks: {duckCount}</div>
				<div className='text-lg font-medium'>
					Score: {Math.floor(score)}
				</div>
			</div>

			{gameState === 'welcome' && (
				<div className='absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center'>
					<h1 className='text-4xl font-bold'>Duck Duck Goose!</h1>
				</div>
			)}

			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
				<PushButton
					onClick={handleClick}
					disabled={isResetting}
					isButtonCooldown={isButtonCooldown}
				/>
			</div>

			{gameState === 'gameover' && (
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-white p-8 rounded-lg shadow-lg'>
					<h2 className='text-3xl font-bold mb-4'>Game Over!</h2>
					<p className='text-xl mb-4'>
						Final Score: {Math.floor(score)}
					</p>
					<div className='mb-6'>
						<h3 className='text-xl font-bold mb-2'>High Scores</h3>
						<ul>
							{highScores.map((hs, index) => (
								<li key={index} className='text-lg'>
									{Math.floor(hs.score)} -{' '}
									{new Date(hs.date).toLocaleDateString()}
								</li>
							))}
						</ul>
					</div>
					<button
						onClick={handleClick}
						className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
						Play Again
					</button>
				</div>
			)}
		</div>
	);
};

export default DuckGooseGame;
