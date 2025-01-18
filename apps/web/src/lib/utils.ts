import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const publicRoutes = ["/login", "/signup", "/password/reset", "/reset-password", "/callback"];

export const isPublic = (pathname: string) => {
  return publicRoutes.includes(pathname);  
}