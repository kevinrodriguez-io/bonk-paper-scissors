import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import shortUUID from "short-uuid";
import { z } from "zod";
import { CanBeLoading } from "../../types/CanBeLoading";
import { Spinner } from "../Spinner";

const firstCardSchema = z.object({
  gameId: z
    .string()
    .min(3, "Game identifier must be at least 3 characters")
    .max(24, "Game identifier must be at most 24 characters"),
  amount: z.number().min(1000, "Amount must be at least 1000"),
});

type FirstCardProps = CanBeLoading & {
  availableUIAmount: number;
  onCancel?: () => void;
  onSuccess?: (gameId: string, amount: number) => void;
};

export const FirstCard = ({
  availableUIAmount,
  onSuccess,
  onCancel,
  isLoading,
}: FirstCardProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({ resolver: zodResolver(firstCardSchema) });

  useEffect(() => {
    setValue("gameId", shortUUID.generate());
  }, []);

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(({ gameId, amount }) => {
        onSuccess?.(gameId, amount);
      })}
    >
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Notes
            </h3>
            <p className="mt-1 text-sm text-gray-500 text-justify">
              By creating a game you have to provide your choice, which will be
              private until both players reveal. Once revealed, the winner will
              be determined by the bonk, paper, scissors rules.
            </p>
            <p className="mt-1 text-gray-500 text-sm text-justify">
              The winner wins a total of the 90% of the pot (both it's deposit
              and the adversary deposit), while the other 10% is burned 🔥.
            </p>
            <p className="mt-1 text-sm text-red-900 text-justify">
              A player who makes a choice and refuses to reveal is penalized as
              forfeit after 7 days, making the other player the winner, so
              remember to always reveal when prompted.
            </p>
          </div>

          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            <div className="col-span-6 sm:col-span-4">
              <label
                htmlFor="game-id"
                className="block text-sm font-medium text-gray-700"
              >
                Game identifier
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Ex. Kevin's Game"
                  {...register("gameId")}
                />
                <div>
                  <button
                    type="button"
                    className="ml-2 inline-flex items-center px-2.5 py-1.5 mt-1 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => {
                      setValue("gameId", shortUUID.generate());
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>
              {errors.gameId?.message && (
                <p className="text-xs text-red-800">
                  {errors.gameId?.message as string}
                </p>
              )}
            </div>

            <div className="col-span-6 sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700">
                Amount to deposit on the pot
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Ex. 1000000"
                {...register("amount", { valueAsNumber: true })}
              />
              <div className="mt-3 flex gap-1">
                <button
                  type="button"
                  className="flex-1 border-t-teal-500 border-t-4 hover:bg-teal-100 text-sm"
                  onClick={() => {
                    setValue("amount", Math.floor(availableUIAmount * 0.25));
                  }}
                >
                  25%
                </button>
                <button
                  type="button"
                  className="flex-1 border-t-green-500 border-t-4 hover:bg-green-100 text-sm"
                  onClick={() => {
                    setValue("amount", Math.floor(availableUIAmount * 0.5));
                  }}
                >
                  50%
                </button>
                <button
                  type="button"
                  className="flex-1 border-t-lime-500 border-t-4 hover:bg-yellow-100 text-sm"
                  onClick={() => {
                    setValue("amount", Math.floor(availableUIAmount * 0.75));
                  }}
                >
                  75%
                </button>
                <button
                  type="button"
                  className="flex-1 border-t-yellow-500 border-t-4 hover:bg-orange-100 text-sm"
                  onClick={() => {
                    setValue("amount", Math.floor(availableUIAmount * 10));
                  }}
                >
                  100%
                </button>
              </div>
              {errors.amount?.message && (
                <p className="text-xs text-red-800">
                  {errors.amount?.message as string}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="reset"
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          disabled={isLoading}
          onClick={() => onCancel?.()}
        >
          {isLoading ? <Spinner /> : "Cancel"}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isLoading ? <Spinner /> : "Next"}
        </button>
      </div>
    </form>
  );
};
