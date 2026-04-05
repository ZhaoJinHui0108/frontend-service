export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  name?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  name,
}: SelectProps) {
  return (
    <div className="form-group">
      {label && <label>{label}{required && <span className="text-error">*</span>}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        name={name}
        className={error ? 'input-error' : ''}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}