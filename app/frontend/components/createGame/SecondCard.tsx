import { EnvelopeIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useMemo, useState } from "react";
import { getGameSecret, getSalt, SaltResult } from "../../lib/crypto/crypto";
import { CanBeLoading } from "../../types/CanBeLoading";
import { Choice } from "../../types/Choice";
import { Spinner } from "../Spinner";

type SecondCardProps = CanBeLoading & {
  onSuccess?: (salt: SaltResult, choice: Choice) => void;
  onCancel?: () => void;
};

export const SecondCard = ({ onSuccess, onCancel, isLoading }: SecondCardProps) => {
  const [salt, setSalt] = useState<SaltResult | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  // TODO: Move this to zod as in {joinSchema}
  const [error, setError] = useState<string | null>(null);
  const secret = useMemo(() => {
    if (!salt || !choice) return null;
    const secret = getGameSecret(salt, choice);
    const link = `mailto:?subject=My%20game%20secret&body=I'm%20mailing%20myself%20my%20game%20secret%20just%20in%20case%20I%20change%20browser%20or%20have%20to%20resume%20my%20game%20from%20another%20device.%0D%0ASecret%3A%20${secret}`;
    return { secret, link };
  }, [choice, salt]);
  useEffect(() => {
    const { bytesBs58, randomBytes } = getSalt();
    setSalt({ bytesBs58, randomBytes });
  }, []);
  return (
    <>
      <form
        className="space-y-6 mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.target as HTMLFormElement);
          const choice = data.get("choice") as Choice;
          if (!choice) {
            setError("You must choose a valid option");
            return;
          }
          onSuccess?.(salt!, choice);
        }}
      >
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Secrets
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Don't worry, the game is designed so that you can't lose your
                deposit due to somebody else looking at your choice, that's why
                we use your browser to generate security <b>bytes</b> to hide it
                until both players reveal; this is what we call a salt. Remember
                that you can't win if you never reveal your choice.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <b>It is important to know that</b> your browser will try to
                remember your choice and secret bytes, so be sure to not close
                the tab while the game is being created or clear your browser
                history/cache.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Save the secret below your choice or email it to yourself so you
                can resume the game later on another device if you need to or in
                case of emergency. The reason BPS doesn't send you the game
                secret is because it's unsafe to make it travel through the
                internet and could introduce mistrust in the protocol.
              </p>
            </div>

            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              <div className="mt-4 space-y-4 flex">
                <fieldset>
                  <legend className="contents text-sm font-medium text-gray-700">
                    Your secret choice
                  </legend>
                  <div className="mt-4 space-y-4 flex">
                    <div className="flex items-center relative">
                      <input
                        onChange={() => {
                          setChoice("bonk");
                          setError(null);
                        }}
                        id="bonk"
                        name="choice"
                        type="radio"
                        className="hidden peer"
                        value="bonk"
                      />
                      <label
                        htmlFor="bonk"
                        className="text-center text-black peer-checked:text-white block cursor-pointer rounded-lg peer-checked:bg-primary-600 peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary-500"
                      >
                        <img src="/bat.png" className="h-48 w-48" />
                        Bonk
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        onChange={() => {
                          setChoice("paper");
                          setError(null);
                        }}
                        id="paper"
                        name="choice"
                        type="radio"
                        className="hidden peer"
                        value="paper"
                      />
                      <label
                        htmlFor="paper"
                        className="text-center text-black peer-checked:text-white block cursor-pointer rounded-lg peer-checked:bg-primary-600 peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary-500"
                      >
                        <img src="/paper.png" className="h-48 w-48" />
                        Paper
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        onChange={() => {
                          setChoice("scissors");
                          setError(null);
                        }}
                        id="scissors"
                        name="choice"
                        type="radio"
                        className="hidden peer"
                        value="scissors"
                      />
                      <label
                        htmlFor="scissors"
                        className="text-center text-black peer-checked:text-white block cursor-pointer rounded-lg peer-checked:bg-primary-600 peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary-500"
                      >
                        <img src="/scissors.png" className="h-48 w-48" />
                        Scissors
                      </label>
                    </div>
                  </div>
                </fieldset>
                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}
              </div>
              {choice && salt ? (
                <div>
                  <label
                    htmlFor="gameSecret"
                    className="text-sm font-medium text-gray-700"
                  >
                    Game secret (DO NOT SHARE)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ShieldCheckIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      type="text"
                      id="gameSecret"
                      name="gameSecret"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Game secret"
                      value={secret?.secret ?? ""}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <a
                        className="h-full inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                        href={secret?.link ?? "#"}
                      >
                        <EnvelopeIcon
                          className="h-5 w-5 mr-1 text-gray-400"
                          aria-hidden="true"
                        />
                        Mail myself
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="reset"
            onClick={() => onCancel?.()}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isLoading ? <Spinner /> : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isLoading ? <Spinner /> : "Create Game"}
          </button>
        </div>
      </form>
    </>
  );
};
