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
    POINTS_PER_SECOND: 10, // Points earned per second per healthy duck,
    duckVariants: ['normal', 'cowboy', 'rescue', 'scholar', 'crown', 'wizard'] as const,
    GOOSE: {
        FORCE_PULL_RADIUS: 50, // Radius of gravitational pull
        FORCE_PULL_STRENGTH: 0.5, // Strength of pull (0-1)
        BURST_SPEED_MULTIPLIER: 2.5, // Speed multiplier during burst
        BURST_DURATION: 1500, // Duration of speed burst in ms
        BURST_COOLDOWN: 3000, // Cooldown between bursts in ms
        SIZE_GROWTH_RATE: 0.001, // How much the goose grows per second
        MAX_SIZE: 2, // Maximum size multiplier for the goose
        INITIAL_SIZE: 1.2, // Starting size multiplier
    }
};

export type GameState = 'welcome' | 'playing' | 'gameover';

type DuckVariant = typeof GAME_CONSTANTS.duckVariants[number];

export interface GoosePowers {
    size: number;
    isBursting: boolean;
    lastBurstTime: number;
}

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
    health?: number;
    rotation?: number;
    panicLevel: number;
    variant?: DuckVariant;

    // New goose-specific properties
    size?: number;
    isBursting?: boolean;
    pullRadius?: number;

    // Existing variant-specific properties
    learningProgress?: number;
    safeZoneActive?: boolean;
    safeZoneTimer?: number | null;
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