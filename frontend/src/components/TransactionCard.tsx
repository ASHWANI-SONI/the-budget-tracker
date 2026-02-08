import React from 'react';
import { Check, X, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from './ui/Button';

export interface Transaction {
    id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    accountLast4: string;
    date: string;
    status: 'PENDING' | 'CONFIRMED' | 'DISCARDED';
    bankName?: string;
}

interface TransactionCardProps {
    transaction: Transaction;
    onConfirm: (id: string, updates?: Partial<Transaction>) => void;
    onDiscard: (id: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onConfirm, onDiscard }) => {
    const isCredit = transaction.type === 'CREDIT';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <CreditCard size={12} /> •••• {transaction.accountLast4}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`block font-bold text-lg ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
                        {isCredit ? '+' : ''}₹{Number(transaction.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {transaction.status === 'PENDING' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                    <Button
                        className="flex-1 gap-2"
                        variant="secondary"
                        onClick={() => onDiscard(transaction.id)}
                    >
                        <X size={16} /> Discard
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        onClick={() => onConfirm(transaction.id)}
                    >
                        <Check size={16} /> Confirm
                    </Button>
                </div>
            )}
        </div>
    );
};
