import { Choice } from "../types/Choice";

export const choiceToNumber = (choice: Choice): number => {
  switch (choice) {
    case "bonk":
      return 1;
    case "paper":
      return 2;
    case "scissors":
      return 2;
  }
};
