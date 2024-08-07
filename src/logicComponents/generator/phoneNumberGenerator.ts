import { randPhoneNumber } from "@ngneat/falso";

export const generatePhoneNumber = async (
    itemsCount: number
  ): Promise<string[]> => {
    let names: string[] = randPhoneNumber({ countryCode: "RU", length: itemsCount });
    return names;
  };
  