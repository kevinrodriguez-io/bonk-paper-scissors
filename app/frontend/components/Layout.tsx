import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import cx from "classnames";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  HomeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const NAVIGATION_ROUTES = [
  { name: "Lobby", href: "/", icon: HomeIcon, current: false },
  { name: "Create Game", href: "/create-game", icon: PlusIcon, current: false },
];

type LayoutProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export const Layout = ({ children, title, className }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { asPath } = useRouter();
  const navigation = useMemo(
    () =>
      NAVIGATION_ROUTES.map((route) => ({
        ...route,
        current: route.href === asPath,
      })),
    [asPath]
  );

  return (
    <>
      <div className={className}>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 2xl:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-primary-700 pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img className="h-8 w-auto" src="/bonk-logo.jpeg" />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cx(
                            item.current
                              ? "bg-primary-800 text-white"
                              : "text-primary-100 hover:bg-primary-600",
                            "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                          )}
                        >
                          <item.icon
                            className="mr-4 h-6 w-6 flex-shrink-0 text-primary-300"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden 2xl:fixed 2xl:inset-y-0 2xl:flex 2xl:w-64 2xl:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-grow flex-col overflow-y-auto bg-primary-700 pt-5">
            <div className="flex flex-shrink-0 items-center px-4">
              <img
                className="h-8 w-auto"
                src="/bonk-logo.jpeg"
                alt="Bonk Logo"
              />
            </div>
            <div className="mt-5 flex flex-1 flex-col">
              <nav className="flex-1 space-y-1 px-2 pb-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cx(
                      item.current
                        ? "bg-primary-800 text-white"
                        : "text-primary-100 hover:bg-primary-600",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className="mr-3 h-6 w-6 flex-shrink-0 text-primary-300"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col 2xl:pl-64">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 2xl:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            {/* <div className="flex flex-1 justify-between px-4">
              <div className="flex flex-1">
                <form className="flex w-full 2xl:ml-0" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                      <MagnifyingGlassIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search-field"
                      className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                      placeholder="Search"
                      type="search"
                      name="search"
                    />
                  </div>
                </form>
              </div>
              <div className="ml-4 flex items-center 2xl:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div> */}
            <div className="flex-1" />
            <div className="h-full flex items-center mx-4">
              <WalletMultiButton />
            </div>
          </div>

          <main>
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 2xl:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
              </div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 2xl:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
