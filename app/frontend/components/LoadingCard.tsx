import { Spinner } from "./Spinner";

type LoadingCardProps = {
  message?: string;
};

export const LoadingCard = ({
  message = "Loading games...",
}: LoadingCardProps) => {
  return (
    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 space-y-6 flex flex-row items-center">
      <Spinner />
      &nbsp;{message}
    </div>
  );
};
