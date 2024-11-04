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
		goosePowers,
		lastCaughtDuckVariant,
		lastCaughtDuckSeconds,
	} = useGameLogic();

	// Function to get the display name for a duck variant
	const getDuckVariantDisplayName = (variant: string) => {
		switch (variant) {
			case 'normal':
				return 'Normal Duck';
			case 'cowboy':
				return 'Cowboy Duck';
			case 'scholar':
				return 'Scholar Duck';
			case 'crown':
				return 'Crown Duck';
			case 'rescue':
				return 'Rescue Duck';
			case 'wizard':
				return 'Wizard Duck';
			default:
				return variant;
		}
	};

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

			{/* Game animals */}
			{animals.map((animal) => (
				<GameAnimal
					key={animal.id}
					animal={{
						...animal,
						size:
							animal.type === 'goose'
								? goosePowers.size
								: undefined,
						isBursting:
							animal.type === 'goose'
								? goosePowers.isBursting
								: undefined,
					}}
					chaseMode={chaseMode}
					isResetting={isResetting}
				/>
			))}

			{/* Game stats */}
			<div className='absolute top-4 left-4 space-y-2'>
				<div className='text-lg font-medium'>Ducks: {duckCount}</div>
				<div className='text-lg font-medium'>
					Score: {Math.floor(score)}
				</div>
				{chaseMode && (
					<div className='text-lg font-medium text-red-600'>
						Goose Power: {Math.floor(goosePowers.size * 100)}%
					</div>
				)}
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
						{/* Display the last caught duck variant */}
						{lastCaughtDuckVariant ? (
							<p className='text-lg'>
								The goose caught a{' '}
								{getDuckVariantDisplayName(
									lastCaughtDuckVariant
								)}{' '}
								in {lastCaughtDuckSeconds} seconds!
							</p>
						) : (
							<p className='text-lg'>No ducks were caught.</p>
						)}
					</div>

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
