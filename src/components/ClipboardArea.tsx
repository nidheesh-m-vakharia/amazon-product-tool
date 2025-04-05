"use client";

import { Button, } from "@/components/ui/button";
import { useItems, } from "@/hooks/use-items";
import { Clipboard, } from "lucide-react";
import { useCallback, useMemo, } from "react";
import { toast, } from "sonner";

export function ClipboardArea() {
  const { items, } = useItems();

  // Memoize the CSV content to avoid recalculating it on every render
  const csvContent = useMemo(() => {
    return items
      .map(
        (item,) =>
          `${item.quantity},${item.name},${item.id},${item.link},${item.amount}`,
      )
      .join("\n",);
  }, [items,],);

  // Handle copying to clipboard with memoized callback
  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(csvContent,).then(() => {
      toast.success("Copied to clipboard!",);
    },);
  }, [csvContent,],);

  return (
    <div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Export Data</h2>
        <p className="text-sm">
          Preview and copy your product data to the clipboard
        </p>
        {items.length === 0
          ? (
            <div className="text-center py-8">
              Add some products to see their data here
            </div>
          )
          : (
            <>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
              {csvContent}
              </pre>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={handleCopyToClipboard}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
