// useGameLogic.ts

import { useState, useEffect, useCallback } from 'react';
import { Animal, Confetti, PopupText, GameState, GameScore, GAME_CONSTANTS } from '../types';
import { getRandomPosition, getRandomDirection, getRandomDuckSpeed, normalizeDirection } from '../lib/utils';

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>('welcome');
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [confetti, setConfetti] = useState<Confetti[]>([]);
    const [popupTexts, setPopupTexts] = useState<PopupText[]>([]);
    const [chaseMode, setChaseMode] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState<GameScore[]>([]);
    const [isButtonCooldown, setIsButtonCooldown] = useState(false);
    const [goosePowers, setGoosePowers] = useState({
        size: GAME_CONSTANTS.GOOSE.INITIAL_SIZE,
        isBursting: false,
        lastBurstTime: 0,
    });
    const [lastCaughtDuckVariant, setLastCaughtDuckVariant] = useState<string | null>(null);
    const [lastCaughtDuckSeconds, setLastCaughtDuckSeconds] = useState<string | null>(null);

    // Load high scores
    useEffect(() => {
        const savedScores = localStorage.getItem('duckGameHighScores');
        if (savedScores) {
            setHighScores(JSON.parse(savedScores));
        }
    }, []);

    const saveHighScore = (newScore: number) => {
        const newHighScore: GameScore = {
            score: newScore,
            date: new Date().toISOString(),
        };
        const updatedScores = [...highScores, newHighScore]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        setHighScores(updatedScores);
        localStorage.setItem('duckGameHighScores', JSON.stringify(updatedScores));
    };

    const createConfetti = () => {
        const colors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
        const particles: Confetti[] = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                id: Date.now() + i,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                velocity: {
                    x: (Math.random() - 0.5) * 15,
                    y: Math.random() * -15 - 5,
                },
            });
        }
        setConfetti(particles);
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setAnimals([]);
        setChaseMode(false);
        setIsResetting(false);
    };

    const endGame = () => {
        setGameState('gameover');
        saveHighScore(score);
    };

    const duckCount = animals.filter((a) => a.type === 'duck').length;
    const gooseCount = animals.filter((a) => a.type === 'goose').length;

    useEffect(() => {
        if (popupTexts.length > 0) {
            const interval = setInterval(() => {
                setPopupTexts((prev) =>
                    prev.map((text) => ({
                        ...text,
                        opacity: text.opacity - 0.02,
                        y: text.y - 2, // Move up by 2 pixels each frame
                    }))
                );
            }, 16); // Approximately 60fps

            return () => clearInterval(interval);
        }
    }, [popupTexts.length]);

    const createPopupText = (animal: Animal) => {
        let text = animal.type.toUpperCase();
        if (animal.type === 'duck' && animal.variant && animal.variant !== 'normal') {
            text = `${animal.variant.toUpperCase()} ${text}`;
        }

        const newPopup = {
            id: Date.now(),
            text,
            opacity: 1,
            y: 0,
        };
        setPopupTexts((prev) => [...prev, newPopup]);

        setTimeout(() => {
            setPopupTexts((prev) => prev.filter((p) => p.id !== newPopup.id));
        }, 1000);
    };

    const resetGame = () => {
        setIsResetting(true);
        setChaseMode(false);

        // Store the last caught duck variant before clearing the animals
        const lastDuck = animals.find((a) => a.type === 'duck');
        if (lastDuck && lastDuck.variant) {
            setLastCaughtDuckVariant(lastDuck.variant);
            setLastCaughtDuckSeconds(((Date.now() - lastDuck.id) / 1000).toFixed(1));
        } else {
            setLastCaughtDuckVariant(null);
            setLastCaughtDuckSeconds(null);
        }

        setAnimals((prev) =>
            prev.map((animal) => ({
                ...animal,
                opacity: 0,
            }))
        );

        setTimeout(() => {
            endGame();
            setAnimals([]);
            setIsResetting(false);
        }, 1000);
    };

    const handleClick = useCallback(() => {
        if (isButtonCooldown) return;

        if (gameState === 'welcome' || gameState === 'gameover') {
            startGame();
            return;
        }

        if (isResetting || gameState !== 'playing') return;

        setIsButtonCooldown(true);
        setTimeout(() => setIsButtonCooldown(false), 250);

        const shouldBeDuck = duckCount < 2 || Math.random() > 0.2;
        const canCreateGoose = !shouldBeDuck && gooseCount === 0;

        if (canCreateGoose) {
            createConfetti();
            setChaseMode(true);
        }

        const newAnimal: Animal = {
            id: Date.now(),
            type: canCreateGoose ? 'goose' : 'duck',
            ...getRandomPosition(),
            direction: getRandomDirection(),
            speed: canCreateGoose ? GAME_CONSTANTS.BASE_SPEED : getRandomDuckSpeed(),
            opacity: 1,
            health: canCreateGoose ? undefined : GAME_CONSTANTS.INITIAL_DUCK_HEALTH,
            rotation: Math.random() * 360,
            panicLevel: 0,
            variant: GAME_CONSTANTS.duckVariants[Math.floor(Math.random() * GAME_CONSTANTS.duckVariants.length)],
            // Add variant-specific properties
            learningProgress: 0,
            safeZoneActive: false,
            safeZoneTimer: null,
        };

        createPopupText(newAnimal);
        setAnimals((prev) => [...prev, newAnimal]);
    }, [gameState, isResetting, duckCount, gooseCount, isButtonCooldown]);

    // Scoring system
    useEffect(() => {
        if (gameState !== 'playing') return;

        const scoreInterval = setInterval(() => {
            const healthyDucks = animals.filter(
                (animal) => animal.type === 'duck' && typeof animal.health === 'number' && animal.health > 0
            );

            if (healthyDucks.length > 0) {
                console.log('updated score', (score + healthyDucks.length))
                setScore((prev) => prev + healthyDucks.length);
            }
        }, 1000);

        return () => clearInterval(scoreInterval);
    }, [gameState, animals.length]);

    // Movement and collision detection with variant behaviors
    useEffect(() => {
        if (gameState !== 'playing') return;

        const gameLoop = setInterval(() => {
            setAnimals((prevAnimals) => {
                const updatedAnimals = prevAnimals.map((animal) => {
                    if (animal.type === 'duck') {
                        const nearestGoose = prevAnimals.find((a) => a.type === 'goose');
                        let panicLevel = 0;

                        if (nearestGoose && chaseMode) {
                            const dx = nearestGoose.x - animal.x;
                            const dy = nearestGoose.y - animal.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            // Apply force pull effect if duck is within radius
                            if (distance < GAME_CONSTANTS.GOOSE.FORCE_PULL_RADIUS) {
                                const pullStrength = GAME_CONSTANTS.GOOSE.FORCE_PULL_STRENGTH *
                                    (1 - distance / GAME_CONSTANTS.GOOSE.FORCE_PULL_RADIUS);
                                animal.x += dx * pullStrength * 0.016; // 0.016 is roughly 1/60 for 60fps
                                animal.y += dy * pullStrength * 0.016;
                            }

                            // Apply variant-specific behaviors
                            switch (animal.variant) {
                                case 'scholar':
                                    // Increase learning progress and apply to movement
                                    animal.learningProgress = (animal.learningProgress || 0) + GAME_CONSTANTS.SCHOLAR.BASE_LEARNING_RATE;
                                    animal.speed *= (1 + Math.min(animal.learningProgress, GAME_CONSTANTS.SCHOLAR.MAX_SPEED_INCREASE));
                                    break;

                                case 'rescue':
                                    // Heal nearby ducks
                                    prevAnimals.forEach((nearby) => {
                                        if (nearby.type === 'duck' && nearby.id !== animal.id) {
                                            const healDx = nearby.x - animal.x;
                                            const healDy = nearby.y - animal.y;
                                            const healDistance = Math.sqrt(healDx * healDx + healDy * healDy);

                                            if (healDistance < GAME_CONSTANTS.RESCUE.HEAL_RADIUS && nearby.health) {
                                                nearby.health = Math.min(100, nearby.health + GAME_CONSTANTS.RESCUE.HEAL_RATE);
                                            }
                                        }
                                    });
                                    break;

                                case 'cowboy':
                                    // Enhanced speed and escape ability
                                    animal.speed *= GAME_CONSTANTS.COWBOY.SPEED_MULTIPLIER;
                                    if (distance < GAME_CONSTANTS.FLEE_DISTANCE) {
                                        animal.speed *= GAME_CONSTANTS.COWBOY.ESCAPE_SKILL;
                                    }
                                    break;

                                case 'crown':
                                    // Attract goose more but generate bonus points
                                    if (typeof animal.health === 'number' && animal.health > 0) {
                                        setScore((prev) => prev + (1 * GAME_CONSTANTS.CROWN.POINT_MULTIPLIER) / 60);
                                    }
                                    break;

                                case 'wizard':
                                    // Slow down nearby goose
                                    if (distance < GAME_CONSTANTS.WIZARD.SLOW_RADIUS) {
                                        nearestGoose.speed *= GAME_CONSTANTS.WIZARD.SLOW_FACTOR;
                                    }
                                    break;
                            }



                            // Update panic level with smoothing
                            const targetPanicLevel = Math.max(0, 1 - (distance / GAME_CONSTANTS.FLEE_DISTANCE));
                            // Smooth transition between panic levels (0.1 is the smoothing factor)
                            panicLevel = animal.panicLevel + (targetPanicLevel - animal.panicLevel) * 0.1;

                            // Limit rotation speed based on distance
                            const maxRotationSpeed = 15; // Maximum degrees per frame
                            const rotationSpeed = panicLevel * maxRotationSpeed;

                            // Smoothly interpolate rotation
                            const targetRotation = (animal.rotation || 0) + (rotationSpeed * (Math.random() - 0.5));
                            animal.rotation = (animal.rotation || 0) +
                                (targetRotation - (animal.rotation || 0)) * 0.1; // Smooth rotation transition

                            // Increase damage radius based on goose size
                            const scaledDamageRadius = GAME_CONSTANTS.DAMAGE_RADIUS * goosePowers.size;
                            if (distance < scaledDamageRadius && typeof animal.health === 'number') {
                                if (!animal.safeZoneActive) {
                                    const newHealth = animal.health - (GAME_CONSTANTS.DAMAGE_RATE / 60) * goosePowers.size;
                                    if (newHealth <= 0) {
                                        resetGame();
                                        return animal;
                                    }
                                    animal.health = Math.max(0, newHealth);
                                }
                            }

                            if (distance < GAME_CONSTANTS.FLEE_DISTANCE) {
                                const fleeDirection = normalizeDirection({
                                    x: -dx,
                                    y: -dy,
                                });
                                animal.direction = fleeDirection;
                            }
                        }

                        animal.rotation = (animal.rotation || 0) + (panicLevel * (Math.random() - 0.5) * 30);
                        animal.panicLevel = panicLevel;
                    } else if (animal.type === 'goose' && chaseMode) {
                        // Update goose size over time
                        setGoosePowers(prev => ({
                            ...prev,
                            size: Math.min(prev.size + GAME_CONSTANTS.GOOSE.SIZE_GROWTH_RATE, GAME_CONSTANTS.GOOSE.MAX_SIZE)
                        }));

                        // Goose targeting logic
                        const targets = prevAnimals.filter((a) => a.type === 'duck');
                        const crownDucks = targets.filter((d) => d.variant === 'crown');
                        const target = crownDucks.length > 0 ? crownDucks[0] : targets[0];

                        if (target) {
                            const dx = target.x - animal.x;
                            const dy = target.y - animal.y;
                            animal.direction = normalizeDirection({ x: dx, y: dy });

                            // Apply speed burst if available
                            const currentTime = Date.now();
                            if (!goosePowers.isBursting &&
                                currentTime - goosePowers.lastBurstTime > GAME_CONSTANTS.GOOSE.BURST_COOLDOWN) {
                                setGoosePowers(prev => ({ ...prev, isBursting: true, lastBurstTime: currentTime }));
                                setTimeout(() => {
                                    setGoosePowers(prev => ({ ...prev, isBursting: false }));
                                }, GAME_CONSTANTS.GOOSE.BURST_DURATION);
                            }
                        }

                        // Apply speed modifications
                        animal.speed = GAME_CONSTANTS.BASE_SPEED * (
                            goosePowers.isBursting ? GAME_CONSTANTS.GOOSE.BURST_SPEED_MULTIPLIER : 1
                        );
                    }

                    // Update position
                    const speed = animal.speed * (chaseMode ? GAME_CONSTANTS.CHASE_MULTIPLIER : 1);
                    let newX = animal.x + animal.direction.x * speed;
                    let newY = animal.y + animal.direction.y * speed;

                    // Bounce off walls
                    if (newX < 0 || newX > window.innerWidth - 50) {
                        animal.direction.x *= -1;
                        newX = Math.max(0, Math.min(newX, window.innerWidth - 50));
                    }
                    if (newY < 0 || newY > window.innerHeight - 50) {
                        animal.direction.y *= -1;
                        newY = Math.max(0, Math.min(newY, window.innerHeight - 50));
                    }

                    return {
                        ...animal,
                        x: newX,
                        y: newY,
                    };
                });

                return updatedAnimals;
            });
        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [gameState, chaseMode, goosePowers]);

    return {
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
        lastCaughtDuckSeconds
    };
};