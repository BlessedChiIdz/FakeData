import { randAddress } from "@ngneat/falso"


export const addressGenerator = (itemsCount:number) => {  //mb async
    const streate = randAddress({length:itemsCount});
    return streate
}