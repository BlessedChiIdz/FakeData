import { randFullName, randPhoneNumber } from "@ngneat/falso";

export const generateNames = async (itemsCount: number): Promise<string[]> => {
  let names: string[] = randFullName({
    length: itemsCount,
    withAccents: false,
    gender: "male",
  });
  return names;
};

