import { Spinner } from "./Spinner";

type SpinnerToastProps = {
  children: React.ReactNode;
};

export const SpinnerToast = ({ children }: SpinnerToastProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Spinner />
      <div>{children}</div>
    </div>
  );
};
