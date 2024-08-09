import { randFullName, randPhoneNumber } from "@ngneat/falso";

export const namesGenerator = async (itemsCount: number): Promise<string[]> => {
  let names: string[] = await randFullName({
    length: itemsCount,
    withAccents: false,
    gender: "male",
  });
  
  return names;
};

