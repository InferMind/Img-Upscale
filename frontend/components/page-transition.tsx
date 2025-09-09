"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  className = "",
}: {
  children: ReactNode
  direction?: "left" | "right" | "up" | "down"
  delay?: number
  className?: string
}) {
  const variants = {
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 },
    up: { y: -50, opacity: 0 },
    down: { y: 50, opacity: 0 },
  }

  return (
    <motion.div
      initial={variants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({
  children,
  delay = 0,
  className = "",
}: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
