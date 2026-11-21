import type { LucideIcon } from 'lucide-react'
import { BriefcaseBusiness, Bus, CircleDollarSign, Gift, GraduationCap, HeartPulse, House, Landmark, MoreHorizontal, PiggyBank, Plane, ReceiptText, ShoppingBag, Utensils, WalletCards, Zap } from 'lucide-react'

export const categoryIcons: Record<string, LucideIcon> = {
  wallet: WalletCards,
  salary: BriefcaseBusiness,
  food: Utensils,
  transport: Bus,
  shopping: ShoppingBag,
  home: House,
  health: HeartPulse,
  education: GraduationCap,
  travel: Plane,
  bills: Zap,
  gift: Gift,
  savings: PiggyBank,
  bank: Landmark,
  money: CircleDollarSign,
  receipt: ReceiptText,
  other: MoreHorizontal
}

export const iconOptions = Object.keys(categoryIcons)

export function CategoryIcon({ name, className = 'size-5' }: { name: string; className?: string }) {
  const Icon = categoryIcons[name] ?? MoreHorizontal
  return <Icon aria-hidden="true" className={className} />
}
