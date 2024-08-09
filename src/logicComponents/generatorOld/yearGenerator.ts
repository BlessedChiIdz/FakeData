import { randNumber } from "@ngneat/falso";

export const yearGenerator = async(itemsCount:number) => {
  let year = await randNumber({ min: 1958, max: 2010,length:itemsCount});
  return year;
};
