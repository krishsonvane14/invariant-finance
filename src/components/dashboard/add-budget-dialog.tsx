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
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Monthly Budget</DialogTitle>
        </DialogHeader>
        <form 
          action={async (formData) => {
            await createBudget(formData);
            setOpen(false);
          }} 
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
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
            <Label>Monthly Limit ($)</Label>
            <Input name="amount" type="number" placeholder="500" required />
          </div>
          <Button type="submit">Save Budget</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}