"use client";

import { composeItems, } from "@/actions";
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { tryCatch, } from "@/lib/utils";
import { useItems, } from "@/hooks/use-items";
import { Plus, } from "lucide-react";
import { useCallback, useState, } from "react";
import { toast, } from "sonner";

export function Form() {
  const { addItem, exists } = useItems();
  const [isSubmitting, setIsSubmitting,] = useState(false,);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>,) => {
      event.preventDefault();

      if (isSubmitting) return;
      setIsSubmitting(true,);

      const formData = new FormData(event.currentTarget,);

      const { data: item, error, } = await tryCatch(composeItems(formData,),);

      if (error || !item) {
        toast.error(
          error?.message || "An error occurred while composing the item.",
        );
        setIsSubmitting(false,);
        return;
      }

      if (exists(item.id,)) {
        toast.error("Product already exists",);
        setIsSubmitting(false,);
        return;
      }

      try {
        addItem(item,);
        toast.success("Product added successfully!",);
        (event.target as HTMLFormElement).reset();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message,);
        } else {
          toast.error("An error occurred while adding the product.",);
        }
      } finally {
        setIsSubmitting(false,);
      }
    },
    [addItem, exists, isSubmitting,],
  );

  return (
    <div className="w-full max-w-md">
      <form
        className="flex flex-col gap-4 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <label htmlFor="link" className="text-sm">
          Product Link
        </label>
        <Input
          id="link"
          type="text"
          placeholder="https://amazon.com/..."
          name="link"
          className="rounded-md"
          required
          aria-label="Product Link"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <span>Adding...</span> : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
