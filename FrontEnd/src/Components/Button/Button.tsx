
import styles from "./Button.module.css";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button = ({
  text,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      className={styles.button}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;