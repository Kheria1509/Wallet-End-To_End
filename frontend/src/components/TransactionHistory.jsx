import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { TransactionFilters } from "./TransactionFilters";
import { ExportButton } from "./ExportButton";
import { getApiUrl, API_CONFIG } from "../config/api";

export const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        startDate: null,
        endDate: null,
        minAmount: null,
        maxAmount: null
    });

    const buildQueryString = (pageNum, filters) => {
        const params = new URLSearchParams({
            page: pageNum,
            limit: 10
        });

        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.minAmount !== null) params.append("minAmount", filters.minAmount);
        if (filters.maxAmount !== null) params.append("maxAmount", filters.maxAmount);

        return params.toString();
    };

    const fetchTransactions = async (pageNum = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const queryString = buildQueryString(pageNum, activeFilters);
            const response = await axios.get(
                `${getApiUrl(API_CONFIG.ENDPOINTS.ACCOUNT_TRANSACTIONS)}?${queryString}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            // Filter out self-transactions
            const currentUserId = localStorage.getItem("userId");
            const filteredTransactions = response.data.transactions.filter(
                (transaction) =>
                    !(
                        transaction.senderId._id === currentUserId &&
                        transaction.receiverId._id === currentUserId
                    )
            );

            setTransactions((prev) =>
                append ? [...prev, ...filteredTransactions] : filteredTransactions
            );
            setHasMore(response.data.hasMore);
            setPage(pageNum);
        } catch (error) {
            toast.error("Failed to load transactions");
        } finally {
            if (append) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchTransactions();
        // Refresh transactions every 30 seconds
        const interval = setInterval(() => fetchTransactions(), 30000);
        return () => clearInterval(interval);
    }, [activeFilters]);

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setPage(1);
    };

    const loadMore = () => {
        if (hasMore && !loadingMore) {
            fetchTransactions(page + 1, true);
        }
    };

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 h-8 w-8 bg-gray-200 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-3 bg-gray-100 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Recent Transactions
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Your latest financial activities
                        </p>
                    </div>
                    <div className="animate-pulse w-24 h-8 bg-gray-100 rounded-full"></div>
                </div>
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Recent Transactions
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Your latest financial activities
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <ExportButton transactions={transactions} />
                    <button
                        onClick={() => fetchTransactions()}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            <TransactionFilters onApplyFilters={handleApplyFilters} />

            {transactions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">No transactions found</p>
                    <p className="text-sm text-gray-400">
                        {Object.values(activeFilters).some((v) => v !== null)
                            ? "Try adjusting your filters"
                            : "Your transactions will appear here"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {transactions.map((transaction) => {
                            const isDebit =
                                transaction.senderId._id ===
                                localStorage.getItem("userId");
                            const formattedDate = new Date(
                                transaction.timestamp
                            ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true
                            });

                            return (
                                <div
                                    key={transaction._id}
                                    className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                                                    isDebit
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-green-100 text-green-600"
                                                }`}
                                            >
                                                {isDebit ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {isDebit
                                                        ? `Sent to ${transaction.receiverId.firstName} ${transaction.receiverId.lastName}`
                                                        : `Received from ${transaction.senderId.firstName} ${transaction.senderId.lastName}`}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formattedDate}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`font-semibold ${
                                                isDebit
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {isDebit ? "-" : "+"}₹
                                            {transaction.amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <div className="pt-4">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium rounded-xl transition-colors duration-200"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Loading more...
                                    </div>
                                ) : (
                                    "Load More Transactions"
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
