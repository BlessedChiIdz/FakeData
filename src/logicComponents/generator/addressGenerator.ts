import { randAddress } from "@ngneat/falso"


export const addressGenerator = async(itemsCount:number) => {  //mb async
    const streate = randAddress({length:itemsCount});
    return streate
}