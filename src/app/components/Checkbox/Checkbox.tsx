import classNames from "classnames";

export interface CheckboxProps {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  handleChange?: (checked: boolean) => void;
  theme?: "primary" | "secondary";
}

export default function Checkbox({
  checked,
  className,
  disabled,
  handleChange,
  theme = "primary",
}: CheckboxProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (handleChange) {
      handleChange(event.target.checked);
    }
  };

  return (
    <div className="flex h-3.5 w-3.5 flex-shrink-0 items-center">
      <div className="group grid size-3.5 grid-cols-1">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleInputChange}
          className={classNames(
            className,
            "rounded border-mute disabled:border-border col-start-1 row-start-1 appearance-none border-2 bg-transparent transition duration-100 ease-in-out checked:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border disabled:bg-card disabled:opacity-40 forced-colors:appearance-auto",
            {
              "checked:border-brand-secondary indeterminate:border-brand-secondary focus-visible:outline-brand-secondary":
                theme === "primary",
              "checked:border-shade-secondary indeterminate:border-shade-secondary focus-visible:outline-secondary":
                theme === "secondary",
            }
          )}
        />
        <div
          className={classNames(
            "pointer-events-none col-start-1 row-start-1 size-1.25 self-center justify-self-center opacity-0 group-has-[:checked]:opacity-100",
            {
              "bg-brand-primary": theme === "primary",
              "bg-shade-secondary": theme === "secondary",
            }
          )}
        ></div>
      </div>
    </div>
  );
}
