import * as React from "react"
import { ExternalLink, ArrowRightLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@api/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@api/components/ui/table"

// ------------------------------------------------------------
// Reusable PillTable (shadcn/ui)
// ------------------------------------------------------------
// - Dark, rounded “pill” rows with spacing between rows
// - Reusable through a simple columns[] config & data[]
// - Optional getHref(row) to render an external-link action
// - Optional className overrides for container and row
// ------------------------------------------------------------

export type PillTableColumn<T> = {
    id: string
    header: React.ReactNode
    cell: (row: T) => React.ReactNode
    className?: string
    width?: string // e.g. "w-[20%]"
}

export function PillTable<T>({
     columns,
     data,
     getHref,
     containerClassName,
     rowClassName,
 }: {
    columns: PillTableColumn<T>[]
    data: T[]
    getHref?: (row: T) => string | undefined
    containerClassName?: string
    rowClassName?: string
}) {
    return (
        <div
            className={
                "w-full rounded-2xl" +
                (containerClassName ?? "")
            }
        >
            <Table className="border-separate border-spacing-y-3  ">
                <TableHeader>
                    <TableRow className="border-0">
                        {columns.map((c) => (
                            <TableHead key={c.id} className={(c.width ?? "") + " " + (c.className ?? "")}>
                                {c.header}
                            </TableHead>
                        ))}
                        {getHref && <TableHead className="w-[5%]"></TableHead>}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((row, i) => {
                        const href = getHref?.(row)
                        return (
                            <TableRow
                                key={(row as any)?.id ?? i}
                                className={
                                    "p-4 bg-[#383D56] m-[6px] overflow-hidden [&>td]:py-4 [&>td]:align-middle " +
                                    (rowClassName ?? "")
                                }
                            >
                                {columns.map((c, ci) => (
                                    <TableCell
                                        key={c.id}
                                        className={(ci === 0 ? "first:rounded-l-2xl " : "") + (c.className ?? "")}
                                    >
                                        {c.cell(row)}
                                    </TableCell>
                                ))}

                                {getHref && (
                                    <TableCell className="last:rounded-r-2xl text-right">
                                        {href ? (
                                            <a href={href} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4 text-[#A6A0BB]" />
                                            </a>
                                        ) : (

                                            <ExternalLink className="h-4 w-4 text-[#A6A0BB]" />
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

// ------------------------------------------------------------
// Specific implementation: Trade History
// ------------------------------------------------------------

export type TradeRow = {
    id: string
    date: string // e.g. "22:12, 21.08.2025"
    from: { amount: string; symbol: string; iconUrl?: string }
    price: string // include units already formatted, e.g. "21.7632 SOL"
    to: { amount: string; symbol: string; iconUrl?: string }
    href?: string // optional explorer link
}

export function TradeHistoryTable({ rows }: { rows: TradeRow[] }) {
    const columns: PillTableColumn<TradeRow>[] = [
        {
            id: "date",
            header: <span className="text-left history-table-col">Date</span>,
            className: "w-[20%] text-slate-300 px-6",
            cell: (r) => <span className="text-slate-300">{r.date}</span>,
            width: "w-[20%]",
        },
        {
            id: "from",
            header: <span className={"text-left history-table-col"}> From </span>,
            className: "w-[30%] px-2 sm:px-3",
            cell: (r) => (
                <TokenWithAmount
                    amount={r.from.amount}
                    symbol={r.from.symbol}
                    iconUrl={r.from.iconUrl}
                />
            ),
            width: "w-[30%]",
        },
        {
            id: "price",
            header: <span className={"text-left history-table-col"}> Price </span>,
            className: "w-[25%] px-2 sm:px-3 text-slate-300",
            cell: (r) => <span className="text-slate-300">{r.price}</span>,
            width: "w-[25%]",
        },
        {
            id: "to",
            header: <span className={"text-left history-table-col"}> To </span>,
            className: "w-[20%] px-2 sm:px-3",
            cell: (r) => (
                <TokenWithAmount
                    amount={r.to.amount}
                    symbol={r.to.symbol}
                    iconUrl={r.to.iconUrl}
                    align="left"
                />
            ),
            width: "w-[20%]",
        },
    ]

    return (
        <PillTable
            columns={columns}
            data={rows}
            getHref={(r) => r.href}
        />
    )
}

function TokenWithAmount({
     amount,
     symbol,
     iconUrl,
     align = "left",
 }: {
    amount: string
    symbol: string
    iconUrl?: string
    align?: "left" | "right"
}) {
    return (
        <div className={`flex items-center gap-3 ${align === "right" ? "justify-end" : ""}`}>
            <Avatar className="h-6 w-6 ">
                {iconUrl ? (
                    <AvatarImage src={iconUrl} alt={symbol} />
                ) : (
                    <AvatarFallback className="text-[10px] bg-slate-700 text-slate-200">
                        {symbol.slice(0, 2)}
                    </AvatarFallback>
                )}
            </Avatar>
            <div className={`flex items-baseline gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
                <span className="text-slate-200">{amount}</span>
                <span className="text-slate-400">{symbol}</span>
            </div>
        </div>
    )
}
