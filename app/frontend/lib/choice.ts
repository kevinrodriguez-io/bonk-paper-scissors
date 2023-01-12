import { Choice } from "../types/Choice";

export const choiceToNumber = (choice: Choice): number => {
  switch (choice) {
    case "bonk":
      return 1;
    case "paper":
      return 2;
    case "scissors":
      return 3;
  }
};

export const numberToChoice = (number: number): Choice => {
  switch (number) {
    case 1:
      return "bonk";
    case 2:
      return "paper";
    case 3:
      return "scissors";
    default:
      throw new Error("Invalid choice bit");
  }
};
