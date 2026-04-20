import { twMerge } from "tailwind-merge";
type Props = React.ComponentProps<"button">;

export const Button: React.FC<Props> = (props) => {
  const { className, children, ...rest } = props;
  return (
    <button
      {...rest}
      className={twMerge(
        "bg-black rounded-md px-4 py-2 text-white hover:bg-gray-900 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400",
        className,
      )}
    >
      {children}
    </button>
  );
};
