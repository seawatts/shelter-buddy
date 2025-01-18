"use client";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";
import { Icons } from "@acme/ui/icons";

interface KennelActionConfirmationDialogProps {
  description: string;
  isLoading?: boolean;
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

export function KennelActionConfirmationDialog({
  description,
  isLoading,
  onConfirm,
  onOpenChange,
  open,
  title,
}: KennelActionConfirmationDialogProps) {
  const isMobile = useIsMobile();

  const Content = (
    <>
      <div className="flex gap-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.Spinner size="sm" variant="primary" className="mr-2" />
          ) : null}
          Confirm
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} snapPoints={[0.4]}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>{Content}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>{Content}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
