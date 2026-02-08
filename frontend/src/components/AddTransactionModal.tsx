import React, { useState } from 'react';
import { Button } from './ui/Button';
import { X } from 'lucide-react';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (amount: number, description: string, type: 'CREDIT' | 'DEBIT') => Promise<void>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onAdd(parseFloat(amount), description, type);
        setLoading(false);
        onClose();
        // Reset form
        setAmount('');
        setDescription('');
        setType('CREDIT');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800">Add Function</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'CREDIT' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}
                                onClick={() => setType('CREDIT')}
                            >
                                Income (Credit)
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'DEBIT' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-500'}`}
                                onClick={() => setType('DEBIT')}
                            >
                                Expense (Debit)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. Logic Pro X"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full mt-2">
                        {loading ? 'Adding...' : 'Add Transaction'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
