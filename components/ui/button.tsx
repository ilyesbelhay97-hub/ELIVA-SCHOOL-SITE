import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "dark" | "text";
  className?: string;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href">;

const variants = {
  primary: "bg-gold text-white hover:bg-white hover:text-ink",
  dark: "bg-ink text-white hover:bg-white hover:text-ink",
  text: "border-b border-ink/30 px-0 text-ink hover:border-ink",
};

export function Button({ children, variant = "primary", className = "", href, ...props }: ButtonProps) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${variants[variant]} ${className}`;
  if (href) return <Link className={classes} href={href}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}
