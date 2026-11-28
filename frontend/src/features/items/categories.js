import {
  Backpack,
  CircleHelp,
  FileText,
  Gem,
  KeyRound,
  Shirt,
  Smartphone,
  Wallet,
} from 'lucide-react'

export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: Smartphone },
  { value: 'wallets', label: 'Wallets & cards', icon: Wallet },
  { value: 'keys', label: 'Keys', icon: KeyRound },
  { value: 'bags', label: 'Bags', icon: Backpack },
  { value: 'clothing', label: 'Clothing', icon: Shirt },
  { value: 'documents', label: 'Documents', icon: FileText },
  { value: 'jewelry', label: 'Jewelry', icon: Gem },
  { value: 'other', label: 'Other', icon: CircleHelp },
]

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value)

export function getCategory(value) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES.at(-1)
}
