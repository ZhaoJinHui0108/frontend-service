export interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  name?: string;
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  name,
}: InputProps) {
  return (
    <div className="form-group">
      {label && <label>{label}{required && <span className="text-error">*</span>}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        name={name}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}