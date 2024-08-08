import { IMainGeneratorProps } from "../../interfaces/IMainGeneratorProps";
import { addressGenerator } from "./addressGenerator";
import { namesGenerator } from "./namesGenerator";
import { phoneNumberGenerator } from "./phoneNumberGenerator";
import { yearGenerator } from "./yearGenerator";


export const mainGenerator = (key:string) => {
    switch (key){
        case 'fio1':
            return namesGenerator
            break;
        case 'phone1':
            return phoneNumberGenerator
            break;
        case 'address':
            return addressGenerator
            break;
        case 'year1':
            return yearGenerator
            break;
    }
}