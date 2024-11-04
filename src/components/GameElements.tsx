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

	const getAnimalStyle = () => {
		const baseStyle = {
			left: animal.x,
			top: animal.y,
			transition: isResetting ? 'opacity 1s' : 'none',
			opacity: animal.opacity,
		};

		if (animal.type === 'goose' && chaseMode) {
			return {
				...baseStyle,
				filter: 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.5))',
			};
		}

		return baseStyle;
	};

	return (
		<div className='absolute transform' style={getAnimalStyle()}>
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

			<div
				className={`transform -translate-x-1/2 -translate-y-1/2 transition-transform ${
					chaseMode && animal.type === 'duck' ? 'text-red-500' : ''
				}`}
				style={{
					fontSize: animal.type === 'duck' ? '1.25rem' : '2.5rem',
					transform: `rotate(${
						Math.atan2(animal.direction.y, animal.direction.x) *
							(180 / Math.PI) +
						(animal.rotation || 0)
					}deg) scale(${
						animal.type === 'duck'
							? 1 + (animal.panicLevel || 0) * 0.2
							: 1.2
					})`,
					filter:
						animal.type === 'goose' && chaseMode
							? 'brightness(1.2)'
							: 'none',
				}}>
				{animal.type === 'duck' ? '🦆' : '🦢'}
			</div>
		</div>
	);
};
