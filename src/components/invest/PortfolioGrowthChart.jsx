'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { formatMonthLabel } from '@/lib/portfolioGrowth'

const INVESTED_COLOR = '#0d2642'
const RETURNED_COLOR = '#ac8b49'

export default function PortfolioGrowthChart({
  data = [],
  locale = 'en',
  investedLabel = 'Invested',
  returnedLabel = 'Returns',
}) {
  if (!Array.isArray(data) || data.length === 0) return null

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioInvestedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INVESTED_COLOR} stopOpacity={0.28} />
              <stop offset="100%" stopColor={INVESTED_COLOR} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="portfolioReturnedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={RETURNED_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={RETURNED_COLOR} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => formatMonthLabel(value, locale)}
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={(value) => `$${formatMoneyAmount(value)}`}
            tick={{ fontSize: 12 }}
            width={80}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value, name) => [`$${formatMoneyAmount(value)}`, name]}
            labelFormatter={(label) => formatMonthLabel(label, locale)}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="invested"
            name={investedLabel}
            stroke={INVESTED_COLOR}
            fill="url(#portfolioInvestedFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="returned"
            name={returnedLabel}
            stroke={RETURNED_COLOR}
            fill="url(#portfolioReturnedFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
