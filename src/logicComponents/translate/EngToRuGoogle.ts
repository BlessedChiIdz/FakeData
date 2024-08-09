import { thirdName } from "../../constants/third.name";
import { IAnyObject } from "../../interfaces/IAnyObject";

const translate = require("node-google-translate-skidz");

class translatorBasic {
  wordEng: string;
  constructor(wordEng: string) {
    this.wordEng = wordEng;
  }
  translate() {
    const itemTranslation = translate(
      {
        text: this.wordEng,
        source: "es",
        target: "ru",
      },
      function (result: any) {
        return result;
      }
    );
  }
}

async function translateFunction(wordEng: string) {
  const itemTranslation = await translate(
    {
      text: wordEng,
      source: "es",
      target: "ru",
    },
    function (result: any) {
      return result;
    }
  );
  return itemTranslation.translation;
}

export async function mapTranslateFunctionName(names: string[], objToPush: string[]) {
  let data = await Promise.all(
    names.map(async (item, index) => {
      item += " " + thirdName[Math.floor(Math.random() * thirdName.length)];
      const translation = await translateFunction(item);
      objToPush.push(translation);
    })
  );
  return objToPush;
}

export async function mapTranslateFunctionObject(objects: IAnyObject[]) {
  let objToPush: IAnyObject[] = [];
  let data = await Promise.all(
    objects.map(async (object, index) => {
      for (const key in object) {
        const value = object[key];
        const valueRu = await translateFunction(value);
        object[key] = valueRu;
      }
      console.log(object);
      objToPush.push(object);
    })
  );
  return objToPush;
}





