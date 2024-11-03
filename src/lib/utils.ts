import { GAME_CONSTANTS } from '../types';

export const getRandomPosition = () => ({
    x: Math.random() * (window.innerWidth - 50),
    y: Math.random() * (window.innerHeight - 50),
});

export const getRandomDirection = () => {
    const angle = Math.random() * 2 * Math.PI;
    return {
        x: Math.cos(angle),
        y: Math.sin(angle),
    };
};

export const getRandomDuckSpeed = () => {
    return GAME_CONSTANTS.BASE_SPEED * (1 + (Math.random() - 0.5) * GAME_CONSTANTS.DUCK_SPEED_VARIANCE * 2);
};

export const normalizeDirection = (direction: { x: number; y: number }) => {
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    return magnitude > 0 ? {
        x: direction.x / magnitude,
        y: direction.y / magnitude,
    } : direction;
};