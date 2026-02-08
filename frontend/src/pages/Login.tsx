import { PiggyBank } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Login() {
    const handleGoogleLogin = () => {
        // Redirect to backend auth endpoint
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        window.location.href = `${apiUrl}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex flex-col items-center justify-center p-4 text-white">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white text-blue-600 p-4 rounded-2xl mb-4 shadow-lg">
                        <PiggyBank size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-center mb-2">BudgetTracker</h1>
                    <p className="text-blue-100 text-center">
                        Track your expenses automatically from bank alerts.
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-3 py-3 text-lg shadow-md transition-transform active:scale-95"
                    >
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Sign in with Google
                    </Button>

                    <p className="text-xs text-center text-blue-200 mt-6">
                        By signing in, you verify that you are enabling email parsing for your account.
                    </p>
                </div>
            </div>
        </div>
    );
}
