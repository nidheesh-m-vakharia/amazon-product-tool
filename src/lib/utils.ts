import { load, } from "cheerio";
import { type ClassValue, clsx, } from "clsx";
import { twMerge, } from "tailwind-merge";
import {
  PRODUCT_ID_NOT_FOUND,
  PRODUCT_NAME_NOT_FOUND,
  PRODUCT_PRICE_NOT_FOUND,
} from "./errors";

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
  const urlObj = new URL(url,);
  const pathname = urlObj.pathname;
  const linkPatterns: RegExp[] = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/([A-Z0-9]{10})/,
  ];

  for (const pattern of linkPatterns) {
    const match = pathname.match(pattern,);
    if (match) {
      return match[1];
    }
  }

  throw PRODUCT_ID_NOT_FOUND;
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

export const extractProductNameAndPrice = (htmlAsString: string,): {
  name: string;
  price: number;
} => {
  const $ = load(htmlAsString,);
  let productName = $("#aod-asin-title-text",).text().trim()
    ?? $(".aod-asin-title-text-class",).text().trim();
  if (!productName) {
    throw PRODUCT_NAME_NOT_FOUND;
  }

  let productPrice;
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
    productPrice = priceElement
      .parent()
      .text();
  }

  if (!productPrice) {
    throw PRODUCT_PRICE_NOT_FOUND;
  }

  productName = limitToSixWords(productName,);
  productPrice = parseFloat(productPrice.replace("$", "",),).toFixed(2,);

  return {
    name: productName,
    price: parseFloat(productPrice,),
  };
};

export const createScrapeUrl = (id: string,): string =>
  `https://www.amazon.com/gp/product/ajax/ref=dp_aod_pn?asin=${id}&m=&qid=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=&pc=dp&experienceId=aodAjaxMain`;

function limitToSixWords(input: string,): string {
  if (input.trim() === "") {
    return "";
  }

  const wordRegex = /\b\w+(?:-\w+)?\b/g;
  const matches = input.match(wordRegex,);

  if (!matches) {
    return "";
  }

  const limitedWords = matches.slice(0, 6,);

  return limitedWords.join(" ",);
}
