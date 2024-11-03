// types.ts

export const GAME_CONSTANTS = {
    BASE_SPEED: 2,
    DUCK_SPEED_VARIANCE: 0.5,
    CHASE_MULTIPLIER: 1.5,
    CATCH_DISTANCE: 30,
    FOLLOW_DISTANCE: 200,
    FLEE_DISTANCE: 150,
    INITIAL_DUCK_HEALTH: 100,
    DAMAGE_RADIUS: 100, // Distance at which ducks start taking damage
    DAMAGE_RATE: 20, // Damage per second when in range
    POINTS_PER_SECOND: 10, // Points earned per second per healthy duck
};

export type GameState = 'welcome' | 'playing' | 'gameover';

export interface Animal {
    id: number;
    type: 'duck' | 'goose';
    x: number;
    y: number;
    direction: {
        x: number;
        y: number;
    };
    speed: number;
    opacity: number;
    health?: number; // Added for ducks
}

export interface Confetti {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    velocity: {
        x: number;
        y: number;
    };
}

export interface PopupText {
    id: number;
    text: string;
    opacity: number;
    y: number;
}

export interface GameScore {
    score: number;
    date: string;
}