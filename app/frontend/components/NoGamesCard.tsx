import Link from "next/link";

export const NoGamesCard = () => {
  return (
    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 space-y-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            No games available
          </h3>
          <p className="mt-1 text-sm text-gray-500 flex flex-col">
            You can create a game by clicking the button below.
            <Link
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              href="/create-game"
            >
              Create game
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
