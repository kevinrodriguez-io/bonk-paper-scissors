import { Choice } from "../types/Choice";

export const choiceToNumber = (choice: Choice): number => {
  switch (choice) {
    case "bonk":
      return 0;
    case "paper":
      return 1;
    case "scissors":
      return 2;
  }
};

export const numberToChoice = (number: number): Choice => {
  switch (number) {
    case 0:
      return "bonk";
    case 1:
      return "paper";
    case 2:
      return "scissors";
    default:
      throw new Error("Invalid choice bit");
  }
};
