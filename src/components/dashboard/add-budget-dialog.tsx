"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBudget } from "@/app/actions";
import { useState } from "react";
import { Plus } from "lucide-react";

export function AddBudgetDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border text-muted-foreground hover:text-brand hover:border-brand text-xs tracking-widest uppercase"
        >
          <Plus className="h-3 w-3" /> Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-sm tracking-widest uppercase text-foreground">
            Create Monthly Budget
          </DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await createBudget(formData);
            setOpen(false);
          }}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Category</Label>
            <Select name="category" required>
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="> select category" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="Food and Drink">Food and Drink</SelectItem>
                <SelectItem value="General Merchandise">General Merchandise</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Rent and Utilities">Rent and Utilities</SelectItem>
                <SelectItem value="Transfer Out">Transfer Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Monthly Limit ($)</Label>
            {/* Terminal-style > prompt prefix */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand text-sm select-none pointer-events-none">
                &gt;
              </span>
              <Input
                name="amount"
                type="number"
                placeholder="500"
                required
                className="bg-muted border-border text-foreground pl-7 tabular-nums"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="bg-brand hover:bg-brand/90 text-[#f0ece8] text-xs tracking-widest uppercase"
          >
            Save Budget
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
