import { Appbar } from "../components/AppBar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import { TransactionHistory } from "../components/TransactionHistory";
import { useState } from "react";

export const Dashboard = () => {
  const [showMobileTransactions, setShowMobileTransactions] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      
      {/* Mobile Transaction History Overlay */}
      {showMobileTransactions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Transaction History</h2>
              <button 
                onClick={() => setShowMobileTransactions(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <TransactionHistory />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            <Balance />
            <Users />
          </div>
          
          {/* Transaction history - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <TransactionHistory />
          </div>

          {/* Mobile Transaction History Button */}
          <div className="fixed bottom-4 right-4 lg:hidden">
            <button
              onClick={() => setShowMobileTransactions(true)}
              className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
