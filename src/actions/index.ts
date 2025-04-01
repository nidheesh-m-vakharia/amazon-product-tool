"use server";

import {
  extractAmazonProductId,
  generateShortenedUrl,
  tryCatch,
  validateAmazonUrl,
} from "@/lib/utils";
import {
  createScrapeUrl,
  extractProductNameAndPrice,
  isValidAmazonUrl,
} from "@/lib/utils";
import { Item, } from "@/types";
import "server-only";

export async function scrapeAmazonProduct(id: string,): Promise<
  {
    name: string;
    price: number;
  } | null
> {
  const url = createScrapeUrl(id,);

  if (!isValidAmazonUrl(url,)) {
    throw new Error("Invalid Amazon URL",);
  }

  console.log({ url, },);

  const scrapedDataPromise = fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Host: "www.amazon.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
      Pragma: "no-cache",
      TE: "Trailers",
      "Upgrade-Insecure-Requests": "1",
    },
  },).then((response,) => {
    if (!response.ok) {
      throw new Error("Could not fetch product data",);
    }

    return response;
  },);
  const response = await scrapedDataPromise;
  const {
    data: html,
    error: htmlError,
  } = await tryCatch(response.text(),);

  if (htmlError || !html) {
    throw htmlError || new Error("html is null",);
  }

  const data = extractProductNameAndPrice(html,);

  if (!data.name || !data.price) {
    throw new Error("Could not extract product data",);
  }

  return data;
}

export const composeItems = async (formData: FormData,) => {
  const link = formData.get("link",) as string;
  const isValid = await validateAmazonUrl(link,);

  console.log({ isValid },);

  if (!isValid) {
    throw new Error("Invalid Amazon URL",);
  }

  const {
    data: productId,
    error: productIdError,
  } = await tryCatch(extractAmazonProductId(link,),);

  if (productIdError) {
    throw new Error("Could not extract product ID from URL",);
  }

  const {
    data: scannedProduct,
    error: scannedProductError,
  } = await tryCatch(scrapeAmazonProduct(productId,),);

  if (scannedProductError || !scannedProduct) {
    throw scannedProductError || new Error("Could not scrape product data",);
  }

  const item: Item = {
    id: productId,
    name: scannedProduct.name,
    link: generateShortenedUrl(productId,),
    quantity: 1,
    cost: scannedProduct.price,
    amount: scannedProduct.price * 1,
  };

  return item;
};
