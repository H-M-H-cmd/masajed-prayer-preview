"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const { t } = useLanguage()

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label={t('common.toggleTheme')}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "light" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    </motion.div>
  )
} 