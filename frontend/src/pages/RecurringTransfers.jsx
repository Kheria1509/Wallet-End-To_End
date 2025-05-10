import { Appbar } from "../components/AppBar";
import { RecurringTransfers as RecurringTransfersComponent } from "../components/RecurringTransfers";

export const RecurringTransfers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RecurringTransfersComponent />
      </div>
    </div>
  );
}; 