import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

export default function PageShell({ children }: PropsWithChildren) {
  return (
    <motion.main
      className="mx-auto min-h-screen w-full max-w-md px-4 pb-4 pt-[calc(18px+env(safe-area-inset-top))]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.main>
  )
}
