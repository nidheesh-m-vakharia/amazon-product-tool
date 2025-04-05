"use client";

import { Item, Items, } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast, } from "sonner";

export type ItemsContextType = {
  items: Items;
  addItem: (item: Item,) => void;
  removeItem: (id: string,) => void;
  updateQuantity: (id: string, quantity: number,) => void;
  exists: (id: string,) => boolean;
  clearAllItems: () => void;
};

const ItemsContext = createContext<ItemsContextType | null>(null,);

export const ItemsProvider = (
  { children, }: { children: React.ReactNode; },
) => {
  const [items, setItems,] = useState<Items>([],);
  const [itemIds, setItemIds,] = useState<Set<string>>(new Set(),);

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

  const removeItem = useCallback(
    (id: string,) => {
      setItems((prevItems,) => prevItems.filter((item,) => item.id !== id));
      setItemIds((prevIds,) => {
        const newIds = new Set(prevIds,);
        newIds.delete(id,);
        return newIds;
      },);
      toast.success("Item removed",);
    },
    [],
  );

  const clearAllItems = useCallback(
    () => {
      if (items.length === 0) {
        return;
      }
      setItems([],);
      setItemIds(new Set(),);
      toast.success("All items removed",);
    },
    [items.length,],
  );

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

  const exists = useCallback(
    (id: string,) => itemIds.has(id,),
    [itemIds,],
  );

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      exists,
      clearAllItems,
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
