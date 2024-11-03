import { Animal, Confetti, PopupText } from '../types';

export const ConfettiParticle = ({ particle }: { particle: Confetti }) => (
	<div
		key={particle.id}
		className='absolute rounded-full'
		style={{
			left: particle.x,
			top: particle.y,
			width: particle.size,
			height: particle.size,
			backgroundColor: particle.color,
		}}
	/>
);

export const PopupMessage = ({ popup }: { popup: PopupText }) => (
	<div
		className='absolute left-1/2 transform -translate-x-1/2 text-7xl font-extrabold text-center pointer-events-none transition-all duration-16'
		style={{
			top: `calc(50% + ${popup.y}px)`,
			opacity: popup.opacity,
			color: popup.text === 'GOOSE' ? '#ff4444' : '#000',
			textShadow: '0 0 10px rgba(255,255,255,0.5)',
			transition: 'opacity 16ms linear, top 16ms linear',
		}}>
		{popup.text}
	</div>
);

export const GameAnimal = ({
	animal,
	chaseMode,
	isResetting,
}: {
	animal: Animal;
	chaseMode: boolean;
	isResetting: boolean;
}) => {
	const getHealthColor = (health: number) => {
		if (health > 70) return 'bg-green-500';
		if (health > 30) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	return (
		<div
			className='absolute transform'
			style={{
				left: animal.x,
				top: animal.y,
				transition: isResetting ? 'opacity 1s' : 'none',
				opacity: animal.opacity,
			}}>
			{/* Health bar for ducks */}
			{animal.type === 'duck' && animal.health !== undefined && (
				<div className='absolute left-1/2 transform -translate-x-1/2 -top-4 w-8'>
					<div className='h-1 w-full bg-gray-200 rounded'>
						<div
							className={`h-full rounded ${getHealthColor(
								animal.health
							)}`}
							style={{ width: `${animal.health}%` }}
						/>
					</div>
				</div>
			)}

			{/* Animal emoji with rotation */}
			<div
				className={`transform -translate-x-1/2 -translate-y-1/2 ${
					chaseMode && animal.type === 'duck' ? 'text-red-500' : ''
				}`}
				style={{
					fontSize: animal.type === 'duck' ? '1.25rem' : '2.5rem',
					transform: `rotate(${
						Math.atan2(animal.direction.y, animal.direction.x) *
						(180 / Math.PI)
					}deg)`,
				}}>
				{animal.type === 'duck' ? '🦆' : '🦢'}
			</div>
		</div>
	);
};
