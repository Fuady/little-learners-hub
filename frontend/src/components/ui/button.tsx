import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-nunito active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-playful hover:shadow-float",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        lavender: "bg-lavender text-lavender-foreground hover:bg-lavender/80 shadow-soft hover:shadow-playful",
        coral: "bg-coral text-coral-foreground hover:bg-coral/80 shadow-soft hover:shadow-playful",
        mint: "bg-mint text-mint-foreground hover:bg-mint/80 shadow-soft hover:shadow-playful",
        sunshine: "bg-sunshine text-sunshine-foreground hover:bg-sunshine/80 shadow-soft hover:shadow-playful",
        sky: "bg-sky text-sky-foreground hover:bg-sky/80 shadow-soft hover:shadow-playful",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-float hover:shadow-float text-lg px-8 py-6 rounded-3xl",
        playful: "bg-gradient-to-r from-lavender via-mint to-sunshine text-foreground shadow-playful hover:shadow-float border-2 border-card",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-10 text-lg",
        xl: "h-16 rounded-3xl px-12 text-xl",
        icon: "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
