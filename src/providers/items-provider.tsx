"use client";

import { Item, Items, } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ItemsContextType = {
  items: Items;
  addItem: (item: Item,) => void;
  removeItem: (id: string,) => void;
  updateQuantity: (id: string, quantity: number,) => void;
  exists: (id: string,) => boolean;
};

const ItemsContext = createContext<ItemsContextType | null>(null,);

export const ItemsProvider = (
  { children, }: { children: React.ReactNode; },
) => {
  // Split state into smaller pieces
  const [items, setItems,] = useState<Items>([],);
  const [itemIds, setItemIds,] = useState<Set<string>>(new Set(),);

  // Add item
  const addItem = useCallback(
    (item: Item,) => {
      if (itemIds.has(item.id,)) {
        throw new Error("Item already exists",);
      }
      setItems((prevItems,) => [...prevItems, item,]);
      setItemIds((prevIds,) => new Set(prevIds,).add(item.id,));
    },
    [itemIds,],
  );

  // Remove item
  const removeItem = useCallback(
    (id: string,) => {
      setItems((prevItems,) => prevItems.filter((item,) => item.id !== id));
      setItemIds((prevIds,) => {
        const newIds = new Set(prevIds,);
        newIds.delete(id,);
        return newIds;
      },);
    },
    [],
  );

  // Update quantity
  const updateQuantity = useCallback(
    (id: string, quantity: number,) => {
      setItems((prevItems,) =>
        prevItems.map((item,) =>
          item.id === id
            ? {
              ...item,
              quantity,
              amount: Math.round(item.cost * quantity * 100,) / 100,
            }
            : item
        )
      );
    },
    [],
  );

  // Check if item exists
  const exists = useCallback(
    (id: string,) => itemIds.has(id,),
    [itemIds,],
  );

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      exists,
    }),
    [items, addItem, removeItem, updateQuantity, exists,],
  );

  return (
    <ItemsContext.Provider value={contextValue}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = (): ItemsContextType => {
  const context = useContext(ItemsContext,);
  if (!context) {
    throw new Error("useItems must be used within an ItemsProvider",);
  }
  return context;
};
