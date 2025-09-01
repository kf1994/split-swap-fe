"use client";

import * as React from "react";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@api/components/ui/tooltip";

interface CustomTooltipProps {
    /** What should trigger the tooltip (button, text, icon, etc.) */
    trigger: React.ReactNode;
    content: React.ReactNode;
    className?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
    trigger,
    content,
    className,
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent className={className}>
                {typeof content === "string" ? <p>{content}</p> : content}
            </TooltipContent>
        </Tooltip>
    );
};
