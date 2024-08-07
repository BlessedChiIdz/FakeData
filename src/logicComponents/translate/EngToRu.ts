import { thirdName } from "../../dictionaries/third.name";
import { IAnyObject } from "../../interfaces/IAnyObject";

const translate = require("node-google-translate-skidz");


class translatorBasic {
  wordEng:string
  constructor(wordEng:string) {
    this.wordEng = wordEng
  }
    translate(){
      const itemTranslation =  translate(
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

async function mapTranslateFunctionName(
  names: string[],
  objToPush: string[]
) {
  let data = await Promise.all(
    names.map(async (item, index) => {
      item += " " + thirdName[Math.floor(Math.random() * thirdName.length)];
      const translation = await translateFunction(item);
      objToPush.push(translation);
    })
  );
  return objToPush;
}

async function mapTranslateFunctionObject(
  objects: IAnyObject[],
  objToPush: string[]
) {
  let data = await Promise.all(
    objects.map(async (item, index) => {
      const translation = await translateFunction(item.qwe);
      objToPush.push(translation);
    })
  );
  return objToPush;
}

export default mapTranslateFunctionName;
