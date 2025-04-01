import { load, } from "cheerio";
import { type ClassValue, clsx, } from "clsx";
import { twMerge, } from "tailwind-merge";

type Success<T,> = {
  data: T;
  error: null;
};

type Failure<E,> = {
  data: null;
  error: E;
};

type Result<T, E,> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error,>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null, };
  } catch (error) {
    return { data: null, error: error as E, };
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs,),);
}

export const validateAmazonUrl = async (url: string,): Promise<boolean> => {
  try {
    const urlObj = new URL(url,);
    return urlObj.hostname.includes("amazon.",)
      && (
        url.includes("/dp/",)
        || url.includes("/gp/product/",)
        || /\/[A-Z0-9]{10}/.test(urlObj.pathname,)
      );
  } catch {
    return false;
  }
};

export const generateShortenedUrl = (id: string,): string => {
  return `https://amzn.com/dp/${id}`;
};

export const extractAmazonProductId = async (url: string,): Promise<string> => {
  try {
    const urlObj = new URL(url,);
    const pathname = urlObj.pathname;

    const dpMatch = pathname.match(/\/dp\/([A-Z0-9]{10})/,);
    if (dpMatch) return dpMatch[1];

    const gpMatch = pathname.match(/\/gp\/product\/([A-Z0-9]{10})/,);
    if (gpMatch) return gpMatch[1];

    const directMatch = pathname.match(/\/([A-Z0-9]{10})/,);
    if (directMatch) return directMatch[1];

    throw new Error("Could not extract product ID from URL",);
  } catch {
    throw new Error("Invalid Amazon URL",);
  }
};

const scrapeableHostnames = ["amazon.com", "www.amazon.com",];
export const isValidAmazonUrl = (url: string,) => {
  try {
    const urlObj = new URL(url,);
    return scrapeableHostnames.includes(urlObj.hostname,);
  } catch {
    return false;
  }
};

export const extractProductNameAndPrice = (htmlAsString: string,) => {
  const $ = load(htmlAsString,);

  let productName = $("#aod-asin-title-text",).text().trim();

  if (!productName) {
    productName = $(".aod-asin-title-text-class",).text().trim();

    console.log({ productName, },);

    if (!productName) {
      throw new Error("Could not extract product name",);
    }
  }

  let price;
  const priceElement = $(
    'span[aria-hidden="true"] > span.a-price-symbol:contains("$")',
  )
    .filter(function() {
      return (
        $(this,).next().is("span.a-price-whole",)
        && $(this,).next().next().is("span.a-price-fraction",)
      );
    },)
    .first();

  if (priceElement.length) {
    price = priceElement
      .parent()
      .text();
  }

  if (!price) {
    throw new Error("Could not extract product price",);
  }

  productName = limitToSixWords(productName,);
  console.log({ productName, price, },);

  return {
    name: productName,
    price: parseFloat(price.replace("$", "",),),
  };
};

export const createScrapeUrl = (id: string,): string =>
  `https://www.amazon.com/gp/product/ajax/ref=dp_aod_pn?asin=${id}&m=&qid=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=&pc=dp&experienceId=aodAjaxMain`;

function limitToSixWords(input: string,): string {
  try {
    if (input.trim() === "") {
      return ""; // Return an empty string for invalid or empty input
    }

    const wordRegex = /\b\w+(?:-\w+)?\b/g;

    const matches = input.match(wordRegex,);

    console.log({ matches, },);

    if (!matches) {
      return "";
    }

    const limitedWords = matches.slice(0, 6,);

    return limitedWords.join(" ",);
  } catch (error) {
    throw error;
  }
}
