import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getEndpointUrl } from '../config/api';

const fetchTransactionsForExport = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.minAmount) params.append('minAmount', filters.minAmount);
        if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

        const response = await axios.get(`${getEndpointUrl('ACCOUNT_TRANSACTIONS_EXPORT')}?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions for export:', error);
        toast.error('Failed to fetch transactions for export');
        return [];
    }
};

export const exportToCSV = async (transactions, filters = {}) => {
    try {
        const allTransactions = await fetchTransactionsForExport(filters);
        if (!allTransactions.length) {
            toast.error('No transactions to export');
            return;
        }

        // Prepare CSV data
        const headers = ['Date', 'Type', 'Amount', 'From/To', 'Status'];
        const csvData = allTransactions.map(transaction => {
            const isDebit = transaction.senderId._id === localStorage.getItem('userId');
            const date = new Date(transaction.timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
            const type = isDebit ? 'Debit' : 'Credit';
            const amount = `₹${transaction.amount.toLocaleString()}`;
            const fromTo = isDebit
                ? `${transaction.receiverId.firstName} ${transaction.receiverId.lastName}`
                : `${transaction.senderId.firstName} ${transaction.senderId.lastName}`;
            const status = 'Completed';

            return [date, type, amount, fromTo, status];
        });

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV exported successfully');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        toast.error('Failed to export CSV');
    }
};

export const exportToPDF = async (transactions, filters = {}) => {
    try {
        const allTransactions = await fetchTransactionsForExport(filters);
        if (!allTransactions.length) {
            toast.error('No transactions to export');
            return;
        }

        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text('Transaction History', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        // Add filter information if any
        let yPos = 22;
        if (Object.values(filters).some(v => v)) {
            yPos += 7;
            doc.text('Filters applied:', 14, yPos);
            if (filters.startDate) {
                yPos += 5;
                doc.text(`From: ${new Date(filters.startDate).toLocaleDateString()}`, 14, yPos);
            }
            if (filters.endDate) {
                yPos += 5;
                doc.text(`To: ${new Date(filters.endDate).toLocaleDateString()}`, 14, yPos);
            }
            if (filters.minAmount) {
                yPos += 5;
                doc.text(`Min Amount: ₹${filters.minAmount}`, 14, yPos);
            }
            if (filters.maxAmount) {
                yPos += 5;
                doc.text(`Max Amount: ₹${filters.maxAmount}`, 14, yPos);
            }
        }

        // Prepare table data
        const tableData = allTransactions.map(transaction => {
            const isDebit = transaction.senderId._id === localStorage.getItem('userId');
            return [
                new Date(transaction.timestamp).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                }),
                isDebit ? 'Debit' : 'Credit',
                `₹${transaction.amount.toLocaleString()}`,
                isDebit
                    ? `${transaction.receiverId.firstName} ${transaction.receiverId.lastName}`
                    : `${transaction.senderId.firstName} ${transaction.senderId.lastName}`,
                'Completed'
            ];
        });

        // Generate table
        doc.autoTable({
            startY: yPos + 10,
            head: [['Date', 'Type', 'Amount', 'From/To', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 139, 202] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Save PDF
        doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF exported successfully');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Failed to export PDF');
    }
}; 