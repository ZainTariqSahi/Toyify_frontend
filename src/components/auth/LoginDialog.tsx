"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import AuthForm from "./AuthForm";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md  rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Login</DialogTitle>
        </VisuallyHidden>

        {/* Reusable AuthForm in login mode */}
        <AuthForm
          isSignupDefault={false}
          onClose={() => onOpenChange(false)} // closes modal after success
        />
      </DialogContent>
    </Dialog>
  );
}
