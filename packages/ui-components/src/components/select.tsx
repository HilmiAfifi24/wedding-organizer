import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "../lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:border-border/70 disabled:bg-muted/40 disabled:text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
    <span aria-hidden className="text-xs text-foreground/70">
      v
    </span>
  </SelectPrimitive.Trigger>
));

SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-40 overflow-hidden rounded-md border border-border bg-background text-foreground shadow-md",
        className
      )}
      {...props}
    />
  </SelectPrimitive.Portal>
));

SelectContent.displayName = "SelectContent";

export const SelectViewport = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Viewport ref={ref} className={cn("p-1", className)} {...props} />
));

SelectViewport.displayName = "SelectViewport";

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm text-foreground outline-none focus:bg-muted/60",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

SelectItem.displayName = "SelectItem";

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1 text-xs font-semibold text-muted-foreground", className)}
    {...props}
  />
));

SelectLabel.displayName = "SelectLabel";

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-border", className)}
    {...props}
  />
));

SelectSeparator.displayName = "SelectSeparator";
