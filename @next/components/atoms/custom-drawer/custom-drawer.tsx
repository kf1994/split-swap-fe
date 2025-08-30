"use client"

import * as React from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import {CrossIcon} from "@svgs";

interface DrawerProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    title?: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, children, title }) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="fixed inset-0 "
                onClick={onClose}
            />

            {/* Drawer panel */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 h-full w-[375px] drawer-bg blur-bg flex flex-col gap-3"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 ">
                    <div className="text-lg font-semibold">{title}</div>
                    <button onClick={onClose} className="p-2 border border-white icon-bg rounded-full">
                        <CrossIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
            </motion.div>
        </div>
    )
}
