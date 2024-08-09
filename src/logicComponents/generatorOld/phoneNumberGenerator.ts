import { randPhoneNumber } from "@ngneat/falso";

export const phoneNumberGenerator = async (
    itemsCount: number
  ): Promise<string[]> => {
    let phone: string[] = await randPhoneNumber({ countryCode: "RU", length: itemsCount });
    return phone;
  };
  