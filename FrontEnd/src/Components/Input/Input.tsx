
import styles from "./Input.module.css";

interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}: InputProps) => {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={styles.input}
      />
    </div>
  );
};

export default Input;