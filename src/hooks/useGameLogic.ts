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
    const [countdown, setCountdown] = useState(0);
    const [isResetting, setIsResetting] = useState(false);
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState<GameScore[]>([]);
    const [isButtonCooldown, setIsButtonCooldown] = useState(false);

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
        setCountdown(0);
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

    const createPopupText = (text: string) => {
        const newPopup = {
            id: Date.now(),
            text,
            opacity: 1,
            y: 0,
        };
        setPopupTexts((prev) => [...prev, newPopup]);

        // Remove popup after animation
        setTimeout(() => {
            setPopupTexts((prev) => prev.filter((p) => p.id !== newPopup.id));
        }, 1000);
    };

    const resetGame = () => {
        setIsResetting(true);
        setChaseMode(false);
        setCountdown(0);

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
        setTimeout(() => setIsButtonCooldown(false), 250); // 250ms cooldown

        const shouldBeDuck = duckCount < 2 || Math.random() > 0.2;
        const canCreateGoose = !shouldBeDuck && gooseCount === 0;

        if (canCreateGoose) {
            createConfetti();
            setChaseMode(true);
            setCountdown(10);
        }

        const newAnimal: Animal = {
            id: Date.now(),
            type: canCreateGoose ? 'goose' : 'duck',
            ...getRandomPosition(),
            direction: getRandomDirection(),
            speed: canCreateGoose ? GAME_CONSTANTS.BASE_SPEED : getRandomDuckSpeed(),
            opacity: 1,
            health: canCreateGoose ? undefined : GAME_CONSTANTS.INITIAL_DUCK_HEALTH,
        };

        createPopupText(newAnimal.type.toUpperCase());
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

    // Movement and collision detection
    useEffect(() => {
        if (gameState !== 'playing') return;

        const gameLoop = setInterval(() => {
            setAnimals((prevAnimals) => {
                const updatedAnimals = prevAnimals.map((animal) => {
                    if (animal.type === 'duck') {
                        const nearestGoose = prevAnimals.find((a) => a.type === 'goose');

                        if (nearestGoose && chaseMode) {
                            const dx = nearestGoose.x - animal.x;
                            const dy = nearestGoose.y - animal.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            // Update health if goose is nearby
                            if (distance < GAME_CONSTANTS.DAMAGE_RADIUS && typeof animal.health === 'number') {
                                const newHealth = animal.health - GAME_CONSTANTS.DAMAGE_RATE / 60;
                                if (newHealth <= 0) {
                                    resetGame();
                                    return animal;
                                }
                                animal.health = Math.max(0, newHealth);
                            }

                            // Flee from goose
                            if (distance < GAME_CONSTANTS.FLEE_DISTANCE) {
                                const fleeDirection = normalizeDirection({
                                    x: -dx,
                                    y: -dy,
                                });
                                animal.direction = fleeDirection;
                            }
                        }
                    } else if (animal.type === 'goose' && chaseMode) {
                        const nearestDuck = prevAnimals.find((a) => a.type === 'duck');
                        if (nearestDuck) {
                            const dx = nearestDuck.x - animal.x;
                            const dy = nearestDuck.y - animal.y;
                            animal.direction = normalizeDirection({ x: dx, y: dy });
                        }
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
        }, 1000 / 60); // 60 FPS

        return () => clearInterval(gameLoop);
    }, [gameState, chaseMode]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (countdown === 0 && chaseMode) {
            setChaseMode(false);
        }
    }, [countdown, chaseMode]);

    return {
        gameState,
        animals,
        confetti,
        popupTexts,
        chaseMode,
        countdown,
        isResetting,
        duckCount,
        score,
        highScores,
        handleClick,
        isButtonCooldown
    };
};