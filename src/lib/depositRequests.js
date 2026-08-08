export const depositRequestInclude = {
  user: { select: { id: true, email: true, type: true, accountStatus: true } },
  property: {
    select: {
      id: true,
      name: true,
      investmentId: true,
      slug: true,
      price: true,
      status: true,
    },
  },
  reviewedBy: { select: { id: true, email: true } },
  createdByAdmin: { select: { id: true, email: true } },
  contribution: { select: { id: true, amount: true, status: true } },
  investmentIntent: {
    select: { id: true, status: true, channel: true, intendedAmount: true },
  },
}

export function toClientDepositRequest(deposit) {
  if (!deposit) return deposit
  const { receiptStorageKey, ...rest } = deposit
  return {
    ...rest,
    hasReceipt: Boolean(receiptStorageKey),
  }
}
