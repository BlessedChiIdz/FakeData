import { IMainGeneratorProps } from "../../interfaces/IMainGeneratorProps";
import { generateNames } from "./namesGenerator";
import { generatePhoneNumber } from "./phoneNumberGenerator";


export const mainGenerator = (props:IMainGeneratorProps) => {
    
    if(props.name){
        const names = generateNames(props.params.itemsCount)
    }


    if(props.phone){
        const phone = generatePhoneNumber(props.params.itemsCount)
    }
}