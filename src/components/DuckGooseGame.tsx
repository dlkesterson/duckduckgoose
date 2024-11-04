import { useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { ConfettiParticle, PopupMessage, GameAnimal } from './GameElements';
import { PushButton } from './PushButton';
import { HelpCircle, X } from 'lucide-react';

const DuckGooseGame = () => {
	const [showHelp, setShowHelp] = useState(false);
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

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		// Get the user's timezone offset in minutes and convert to milliseconds
		const tzOffset = date.getTimezoneOffset() * 60000;
		// Create a new date object adjusted for the local timezone
		const localDate = new Date(date.getTime() - tzOffset);

		const hours = localDate.getHours();
		const minutes = localDate.getMinutes();
		const ampm = hours >= 12 ? 'pm' : 'am';
		const formattedHours = hours % 12 || 12;
		const formattedMinutes = minutes.toString().padStart(2, '0');

		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];

		const day = days[localDate.getDay()];
		const month = months[localDate.getMonth()];
		const dayOfMonth = localDate.getDate();

		// Handle ordinal suffixes
		const ordinalRules = new Intl.PluralRules('en', { type: 'ordinal' });
		const suffixes = {
			one: 'st',
			two: 'nd',
			few: 'rd',
			other: 'th',
		};
		const suffix = suffixes[ordinalRules.select(dayOfMonth)];
		const year = localDate.getFullYear();

		return `${formattedHours}:${formattedMinutes}${ampm} on ${day}, ${month}. ${dayOfMonth}${suffix} ${year}`;
	};

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

	const HelpContent = () => (
		<div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
			<div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] relative'>
				<div className='absolute right-2 top-2'>
					<button
						onClick={() => setShowHelp(false)}
						className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
						<X className='w-6 h-6' />
					</button>
				</div>
				<div className='p-6 overflow-y-auto max-h-[80vh]'>
					<h2 className='text-2xl font-bold mb-4'>
						How to Play Duck Duck Goose!
					</h2>

					<div className='space-y-4'>
						<section>
							<h3 className='text-xl font-semibold mb-2'>
								Basic Gameplay
							</h3>
							<p>
								Click the green button to add ducks to the pond.
								Sometimes, you might spawn a goose instead! Keep
								your ducks alive as long as possible to score
								points.
							</p>
						</section>

						<section>
							<h3 className='text-xl font-semibold mb-2'>
								Special Duck Types
							</h3>
							<ul className='list-disc pl-5 space-y-2'>
								<li>
									<span className='font-medium'>
										Scholar Duck:
									</span>{' '}
									Gets faster as it learns to escape
								</li>
								<li>
									<span className='font-medium'>
										Rescue Duck:
									</span>{' '}
									Heals nearby ducks
								</li>
								<li>
									<span className='font-medium'>
										Cowboy Duck:
									</span>{' '}
									Moves faster and has enhanced escape
									abilities
								</li>
								<li>
									<span className='font-medium'>
										Crown Duck:
									</span>{' '}
									Attracts the goose but gives bonus points
								</li>
								<li>
									<span className='font-medium'>
										Wizard Duck:
									</span>{' '}
									Can slow down nearby geese
								</li>
							</ul>
						</section>

						<section>
							<h3 className='text-xl font-semibold mb-2'>
								The Goose
							</h3>
							<ul className='list-disc pl-5 space-y-2'>
								<li>The goose grows stronger over time</li>
								<li>
									Has a gravitational pull effect on nearby
									ducks
								</li>
								<li>Can perform speed bursts to catch ducks</li>
								<li>
									Game ends if a duck's health reaches zero
								</li>
							</ul>
						</section>

						<section>
							<h3 className='text-xl font-semibold mb-2'>
								Scoring
							</h3>
							<p>
								Score points for each half second your ducks
								survive. Crown Ducks give bonus points!
							</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);

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
					<button
						onClick={() => setShowHelp(true)}
						className='p-2 hover:bg-white/50 rounded-full transition-colors'
						aria-label='Show help'>
						<HelpCircle className='w-6 h-6' />
					</button>
				</div>
			)}

			{showHelp && <HelpContent />}

			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
				<PushButton
					onClick={handleClick}
					disabled={isResetting}
					isButtonCooldown={isButtonCooldown}
				/>
			</div>

			{gameState === 'gameover' && (
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-white p-8 w-10/12 rounded-lg shadow-lg'>
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
									{formatDate(hs.date)}
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
