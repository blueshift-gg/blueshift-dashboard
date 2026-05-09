import classNames from "classnames";

interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  return <div className={classNames("border-t border-t-border h-px w-full", className)}></div>;
}
