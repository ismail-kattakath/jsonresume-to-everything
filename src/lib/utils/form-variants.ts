/**
 * Form variant types and styles
 * Centralized to maintain consistency across FormInput and FormTextarea components
 */

/**
 * Union type for supported color themes in form interactive elements.
 */
export type FormVariant = 'teal' | 'indigo' | 'pink' | 'purple' | 'emerald' | 'violet' | 'blue' | 'amber'

/**
 * Tailwind classes for form variants
 * Defines focus border and ring colors for each theme
 */
export const variantClasses: Record<FormVariant, string> = {
  teal: 'focus:border-teal-400 focus:ring-teal-400/20',
  indigo: 'focus:border-indigo-400 focus:ring-indigo-400/20',
  pink: 'focus:border-pink-400 focus:ring-pink-400/20',
  purple: 'focus:border-purple-400 focus:ring-purple-400/20',
  emerald: 'focus:border-emerald-400 focus:ring-emerald-400/20',
  violet: 'focus:border-violet-400 focus:ring-violet-400/20',
  blue: 'focus:border-blue-400 focus:ring-blue-400/20',
  amber: 'focus:border-amber-400 focus:ring-amber-400/20',
}
