import { base, en,  faker,  Faker, ru } from '@faker-js/faker';


 (faker as any).CustomFakerMethods = {
  randomNumber :()=>{
    return Math.floor(Math.random()* (10000-1000 - 1))+1000
  }
 }


export const customFaker:Faker = new Faker({
  locale: [ru],
});