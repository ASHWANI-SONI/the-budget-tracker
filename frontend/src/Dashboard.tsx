import { useEffect, useState } from 'react';
import { Settings, LogOut, Bell, PiggyBank, Check, Clock } from 'lucide-react';
import { TransactionCard } from './components/TransactionCard';
import type { Transaction } from './components/TransactionCard';
import api from './lib/api';

// User ID handling moved inside component

import { AddTransactionModal } from './components/AddTransactionModal';

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUserId = urlParams.get('userId');
        const storedUserId = localStorage.getItem('budget_tracker_user_id');

        if (urlUserId) {
            // Login success callback
            localStorage.setItem('budget_tracker_user_id', urlUserId);
            setUserId(urlUserId);
            // Clean URL
            window.history.replaceState({}, '', '/dashboard');
        } else if (storedUserId) {
            // Session exists
            setUserId(storedUserId);
        } else {
            // Not authenticated (should be caught by ProtectedRoute but double check)
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchTransactions();
            fetchBalance();
        }
    }, [userId]);

    const fetchBalance = async () => {
        if (!userId) return;
        try {
            const response = await api.get(`/users/${userId}`);
            setBalance(response.data.totalBalance);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const fetchTransactions = async () => {
        if (!userId) return;
        try {
            const response = await api.get(`/transactions/pending?userId=${userId}`);
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            await api.post(`/transactions/${id}/confirm`);
            // Update local state to remove confirmed item
            setTransactions(prev => prev.filter(t => t.id !== id));
            fetchBalance();
        } catch (error) {
            console.error('Failed to confirm transaction:', error);
        }
    };

    const handleDiscard = async (id: string) => {
        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to discard transaction:', error);
        }
    };

    const handleAddTransaction = async (amount: number, description: string, type: 'CREDIT' | 'DEBIT') => {
        if (!userId) return;
        try {
            await api.post('/transactions', {
                userId,
                amount,
                description,
                type,
                transactionDate: new Date().toISOString()
            });
            fetchBalance(); // Update balance immediately
            // Optionally fetch transactions if we want to show manual ones in the list?
            // Current list is "Pending Review". Manual ones are "Confirmed".
            // So we just update balance.
            alert('Transaction added successfully!');
        } catch (error) {
            console.error('Failed to add transaction:', error);
            alert('Failed to add transaction');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <PiggyBank size={20} />
                    </div>
                    <h1 className="font-bold text-lg text-gray-900">BudgetTracker</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => alert('Notifications coming soon!')}
                        className="text-gray-500 hover:text-gray-700 relative"
                    >
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <button
                        onClick={() => alert('Settings coming soon!')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-6 max-w-lg mx-auto">
                {/* Balance Card */}
                <section className="mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold">₹</span>
                            <span className="text-4xl font-bold tracking-tight">
                                {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Add Money
                            </button>
                            <button
                                onClick={() => alert('Analytics feature coming soon!')}
                                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Analytics
                            </button>
                        </div>
                    </div>
                </section>

                {/* Pending Transactions */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-800 text-lg">Pending Review</h2>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                            {transactions.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Check size={32} className="text-gray-300" />
                            </div>
                            <p>All caught up! No pending transactions.</p>
                        </div>
                    ) : (
                        <div>
                            {transactions.map(transaction => (
                                <TransactionCard
                                    key={transaction.id}
                                    transaction={transaction}
                                    onConfirm={handleConfirm}
                                    onDiscard={handleDiscard}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Mobile Nav */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center text-gray-400 max-w-lg left-1/2 -translate-x-1/2">
                <button className="flex flex-col items-center gap-1 text-blue-600">
                    <PiggyBank size={24} />
                    <span className="text-[10px] font-medium">Home</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 hover:text-gray-600"
                    onClick={() => window.location.href = '/history'}
                >
                    <Clock size={24} />
                    <span className="text-[10px] font-medium">History</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 hover:text-gray-600"
                    onClick={() => {
                        localStorage.removeItem('budget_tracker_user_id');
                        window.location.href = '/login';
                    }}
                >
                    <LogOut size={24} />
                    <span className="text-[10px] font-medium">Logout</span>
                </button>
            </nav>

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddTransaction}
            />
        </div>
    );
}
