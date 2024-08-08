import { randNumber } from "@ngneat/falso";

export const yearGenerator = () => {
  let year = randNumber({ min: 1958, max: 2010 });
  return year;
};
