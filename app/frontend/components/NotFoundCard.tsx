export const NotFoundCard = () => {
  return (
    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 space-y-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The page you are looking for does not exist.
          </p>
        </div>
      </div>
    </div>
  );
};
