"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SignupForm } from "./SignupForm";

export function SignupDialog({ open, onOpenChange }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 rounded-2xl">
        <SignupForm onSwitchToLogin={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
