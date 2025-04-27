import { Appbar } from "../components/AppBar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import { TransactionHistory } from "../components/TransactionHistory";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            <Balance />
            <Users />
          </div>
          
          {/* Transaction history sidebar */}
          <div className="lg:col-span-1">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </div>
  );
};
