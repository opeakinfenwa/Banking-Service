export interface TransactionCompletedEvent {
  userId: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  transactionId: string;
  timestamp: string;
}

export interface TransactionFailedEvent {
  userId: string;
  fromAccount: string;
  toAccount?: string;
  amount?: number;
  reason: string;
  transactionId?: string;
  timestamp: string;
}

export interface AccountFundedPayload {
  userId: string;
  accountNumber: string;
  amount: number;
  balance: number;
}