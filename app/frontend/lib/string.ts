export const hideMiddle = (str: string) => {
  if (str.length <= 8) {
    return str;
  }
  const first = str.slice(0, 4);
  const last = str.slice(str.length - 4);
  return `${first}...${last}`;
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const splitLowerCaseItemIntoWords = (lowerCaseItem: string) =>
  lowerCaseItem
    .split(/(?=[A-Z])/)
    .join(" ")
    .toLowerCase();

export const formatNumber = (str: string) => {
  const parts = str.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};
