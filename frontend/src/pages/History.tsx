import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import api from '../lib/api';

interface Transaction {
    id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    accountLast4: string;
    transactionDate: string;
    status: string;
}

export default function History() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('budget_tracker_user_id');
        if (!userId) {
            window.location.href = '/login';
            return;
        }

        fetchHistory(userId);
    }, []);

    const fetchHistory = async (userId: string) => {
        try {
            const response = await api.get(`/transactions/history?userId=${userId}`);
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Group transactions by month
    const groupedTransactions: Record<string, Transaction[]> = {};
    transactions.forEach(txn => {
        const date = new Date(txn.transactionDate);
        const monthYear = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        if (!groupedTransactions[monthYear]) {
            groupedTransactions[monthYear] = [];
        }
        groupedTransactions[monthYear].push(txn);
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900">Transaction History</h1>
                </div>
            </header>

            <main className="px-4 py-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p>No transaction history yet.</p>
                        <p className="text-sm mt-1">Confirmed transactions will appear here.</p>
                    </div>
                ) : (
                    Object.entries(groupedTransactions).map(([monthYear, txns]) => (
                        <div key={monthYear} className="mb-6">
                            <h2 className="text-sm font-semibold text-gray-500 mb-2">{monthYear}</h2>
                            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                {txns.map((txn, idx) => (
                                    <div
                                        key={txn.id}
                                        className={`flex items-center justify-between p-4 ${idx !== txns.length - 1 ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'CREDIT'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                                }`}>
                                                {txn.type === 'CREDIT'
                                                    ? <ArrowDownLeft size={20} />
                                                    : <ArrowUpRight size={20} />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {txn.description || 'Transaction'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(txn.transactionDate)}
                                                    {txn.accountLast4 && ` • ****${txn.accountLast4}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {txn.type === 'CREDIT' ? '+' : '-'}{formatAmount(txn.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
