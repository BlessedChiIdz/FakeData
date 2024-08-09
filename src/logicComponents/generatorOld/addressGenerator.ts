import { randAddress, randLatitude, randLongitude, randNumber } from "@ngneat/falso"
import { IAddress } from "../../interfaces/IAddress1";
import { v4 as uuidv4 } from 'uuid';


export const addressGenerator = async(itemsCount:number) => {  //mb async
    const addresses = await randAddress({length:itemsCount});
    const obj:string[] = []
    
    addresses.map((address)=>{
        const fullText = ` ${address.county}  ${address.street}`
        const latitude = randLatitude()
        const longitude = randLongitude()
        const oktmo = `${randNumber({min:15312000, max:95312000})}`
        const houseNumber = `${randNumber({min:20, max:100})}`
        const objToPush:IAddress = {
            uuid: uuidv4(),
            oktmo: oktmo,
            region: address.county, 
            street: address.street,
            strnum: "",
            buildnum: "",
            fullText: fullText,
            latitude: latitude,
            houseUuid: uuidv4(),
            longitude:longitude,
            postalCode: address.zipCode,
            houseNumber: houseNumber
        }
        const qwe = JSON.stringify(objToPush)
        obj.push(qwe)
    })
    
    return obj
}