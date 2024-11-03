import styles from './PushButton.module.css';

interface PushButtonProps {
	onClick: () => void;
	disabled?: boolean;
	isButtonCooldown?: boolean;
}

export const PushButton = ({
	onClick,
	disabled,
	isButtonCooldown,
}: PushButtonProps) => (
	<button
		className={`${styles.pushable} ${
			isButtonCooldown ? styles.cooldown : ''
		}`}
		onClick={onClick}
		disabled={disabled || isButtonCooldown}
		aria-label='Add animal'>
		<span className={styles.shadow}></span>
		<span className={styles.edge}></span>
		<span className={styles.front}></span>
	</button>
);
