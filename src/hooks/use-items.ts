import { Item, Items } from "@/types";
import { create } from "zustand";
import { toast } from "sonner";

type ItemsStore = {
  items: Items;
  itemIds: Set<string>;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  exists: (id: string) => boolean;
  clearAllItems: () => void;
};

export const useItems = create<ItemsStore>((set, get) => ({
  items: [],
  itemIds: new Set(),

  addItem: (item: Item) => {
    if (get().itemIds.has(item.id)) {
      throw new Error("Item already exists");
    }
    set((state) => ({
      items: [...state.items, item],
      itemIds: new Set(state.itemIds).add(item.id),
    }));
  },

  removeItem: (id: string) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      const newIds = new Set(state.itemIds);
      newIds.delete(id);
      toast.success("Item removed");
      return { items: newItems, itemIds: newIds };
    });
  },

  clearAllItems: () => {
    if (get().items.length === 0) {
      return;
    }
    set({ items: [], itemIds: new Set() });
    toast.success("All items removed");
  },

  updateQuantity: (id: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
            ...item,
            quantity,
            amount: Math.round(item.cost * quantity * 100) / 100,
          }
          : item
      ),
    }));
  },

  exists: (id: string) => get().itemIds.has(id),
}));

