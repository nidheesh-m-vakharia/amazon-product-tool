"use client";

import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useItems, } from "@/providers/items-provider";
import { ExternalLink, Trash2, } from "lucide-react";
import { memo, useCallback, } from "react";
import { toast, } from "sonner";

const MemoizedTableRow = memo(function TableRowComponent({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: {
  item: {
    id: string;
    name: string;
    link: string;
    quantity: number;
  };
  onUpdateQuantity: (id: string, quantity: number,) => void;
  onRemoveItem: (id: string,) => void;
},) {
  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>,) => {
      const quantity = parseInt(e.target.value, 10,);
      if (!isNaN(quantity,) && quantity > 0) {
        onUpdateQuantity(item.id, quantity,);
      }
    },
    [item.id, onUpdateQuantity,],
  );

  return (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
      <TableCell className="hidden md:table-cell">{item.id}</TableCell>
      <TableCell className="text-center">
        <Button variant="ghost" size="sm" asChild>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </TableCell>
      <TableCell className="text-center">
        <Input
          type="number"
          value={item.quantity}
          min={1}
          className="w-20 text-center mx-auto border"
          onChange={handleQuantityChange}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(item.id,)}
          className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
},);

export function ItemsList() {
  const { items, removeItem, updateQuantity, clearAllItems, } = useItems();

  const handleRemoveItem = useCallback(
    (id: string,) => {
      removeItem(id,);
      toast.success("Item removed",);
    },
    [removeItem,],
  );

  const handleUpdateQuantity = useCallback(
    (id: string, quantity: number,) => {
      updateQuantity(id, quantity,);
    },
    [updateQuantity,],
  );

  const handleClearItems = useCallback(
    () => {
      if (items.length === 0) {
        return;
      }
      clearAllItems();
      toast.success("All items cleared",);
    },
    [clearAllItems,],
  );

  return (
    <div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Products List</h2>
        <p className="text-sm">Manage your products and quantities here</p>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearItems}
            className="w-fit"
          >
            Clear All
          </Button>
        </div>
        <div className="rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Product Name</TableHead>
                <TableHead className="hidden md:table-cell">ID</TableHead>
                <TableHead className="text-center">Link</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item,) => (
                <MemoizedTableRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <div className="w-full text-center p-4 text-sm text-muted-foreground">
              No items added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
