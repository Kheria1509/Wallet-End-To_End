import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { InputBox } from './InputBox';
import { getApiUrl, getEndpointUrl, API_CONFIG } from '../config/api';

export function RecurringTransfers() {
    const [transfers, setTransfers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        receiverId: '',
        amount: '',
        frequency: 'MONTHLY',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTransfers();
    }, []);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.length >= 1) {
                searchUsers();
            } else {
                setUsers([]);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const searchUsers = async () => {
        if (!searchTerm.trim()) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }
            
            const response = await axios.get(`${getApiUrl(API_CONFIG.ENDPOINTS.USER_BULK)}?filter=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error searching users:', error);
            setError('Failed to search users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData({ ...formData, receiverId: user._id });
        setUsers([]);
        setSearchTerm('');
    };

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }
            
            const response = await axios.get(getEndpointUrl('RECURRING_TRANSFERS'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransfers(response.data);
        } catch (error) {
            console.error('Error fetching recurring transfers:', error);
            setError('Failed to fetch recurring transfers. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedUser) {
            setError('Please select a recipient');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!formData.startDate) {
            setError('Please select a start date');
            return;
        }

        if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
            setError('End date must be after start date');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }
            
            await axios.post(getEndpointUrl('RECURRING_TRANSFERS'), formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Recurring transfer scheduled successfully');
            setShowForm(false);
            await fetchTransfers();
            resetForm();
        } catch (error) {
            console.error('Error creating recurring transfer:', error);
            setError(error.response?.data?.message || 'Failed to schedule recurring transfer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            receiverId: '',
            amount: '',
            frequency: 'MONTHLY',
            startDate: '',
            endDate: '',
            description: ''
        });
        setSelectedUser(null);
        setSearchTerm('');
    };

    const handleCancel = () => {
        setShowForm(false);
        resetForm();
        setError('');
    };

    const handleStatusUpdate = async (transferId, newStatus) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }
            
            await axios.patch(getEndpointUrl('RECURRING_TRANSFER_STATUS', { id: transferId }), 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            await fetchTransfers();
            setSuccess(`Transfer ${newStatus.toLowerCase()} successfully`);
        } catch (error) {
            console.error('Error updating transfer status:', error);
            setError('Failed to update transfer status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (transferId) => {
        if (!window.confirm('Are you sure you want to delete this recurring transfer?')) {
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }
            
            await axios.delete(`${getApiUrl(API_CONFIG.ENDPOINTS.RECURRING_TRANSFERS)}/${transferId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchTransfers();
            setSuccess('Transfer deleted successfully');
        } catch (error) {
            console.error('Error deleting transfer:', error);
            setError('Failed to delete transfer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatFrequency = (frequency) => {
        if (!frequency) return '';
        return frequency.charAt(0) + frequency.slice(1).toLowerCase();
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Outgoing Recurring Transfers</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your scheduled outgoing recurring payments</p>
                </div>
                <Button 
                    onClick={showForm ? handleCancel : () => setShowForm(true)}
                    className={showForm ? "bg-gray-500 hover:bg-gray-600" : ""}
                >
                    {showForm ? 'Cancel' : 'Schedule New Transfer'}
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 shadow-sm">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            
            {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 shadow-sm">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p>{success}</p>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Schedule New Recurring Transfer</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-sm text-blue-700">
                        <p>Set up an automatic recurring transfer to someone. The amount will be automatically sent based on your chosen frequency.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <InputBox
                                    label="Search Recipient"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or username"
                                    autoComplete="off"
                                />
                                {loading && searchTerm && (
                                    <div className="absolute right-2 top-9">
                                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                                {users.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-md shadow-lg max-h-48 overflow-auto">
                                        {users.map((user) => (
                                            <div
                                                key={user._id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                                <div className="text-sm text-gray-600">{user.username}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedUser && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                                        <div className="font-medium text-blue-700">Selected Recipient:</div>
                                        <div className="text-gray-800">{selectedUser.firstName} {selectedUser.lastName}</div>
                                        <div className="text-sm text-gray-600">{selectedUser.username}</div>
                                    </div>
                                )}
                            </div>
                            <InputBox
                                label="Amount (₹)"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                placeholder="Enter amount"
                                required
                                min="1"
                                step="0.01"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="DAILY">Daily</option>
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                </select>
                            </div>
                            <InputBox
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            <InputBox
                                label="End Date (Optional)"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                            />
                            <div className="md:col-span-2">
                                <InputBox
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Enter description (e.g., Rent payment)"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button 
                                type="button" 
                                onClick={handleCancel}
                                className="bg-gray-500 hover:bg-gray-600 mr-2"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={!selectedUser || loading}
                                className={loading ? "opacity-70 cursor-not-allowed" : ""}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : "Schedule Transfer"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {loading && transfers.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="animate-spin h-10 w-10 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-500">Loading your recurring transfers...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {transfers.map((transfer) => (
                        <div key={transfer._id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-start">
                                <div className="w-full md:w-3/4">
                                    <div className="flex items-baseline mb-1">
                                        <h3 className="text-xl font-semibold text-gray-800">₹{parseFloat(transfer.amount).toLocaleString('en-IN')}</h3>
                                        <span className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full ${
                                            transfer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            transfer.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                            transfer.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {transfer.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">To:</span> {transfer.receiverId.firstName} {transfer.receiverId.lastName} ({transfer.receiverId.username})
                                    </p>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">Frequency:</span> {formatFrequency(transfer.frequency)}
                                    </p>
                                    <div className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">Period:</span> {formatDate(transfer.startDate)}
                                        {transfer.endDate ? ` to ${formatDate(transfer.endDate)}` : ' (no end date)'}
                                    </div>
                                    {transfer.lastExecuted && (
                                        <p className="text-sm text-gray-700 mb-1">
                                            <span className="font-medium">Last Transfer:</span> {formatDate(transfer.lastExecuted)}
                                        </p>
                                    )}
                                    {transfer.description && (
                                        <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                            <span className="font-medium">Note:</span> {transfer.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex mt-3 md:mt-0 space-x-2 w-full md:w-auto justify-end">
                                    {transfer.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleStatusUpdate(transfer._id, 'PAUSED')}
                                            className="px-3 py-1 text-sm bg-yellow-50 text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-100 transition-colors"
                                            disabled={loading}
                                        >
                                            Pause
                                        </button>
                                    )}
                                    {transfer.status === 'PAUSED' && (
                                        <button
                                            onClick={() => handleStatusUpdate(transfer._id, 'ACTIVE')}
                                            className="px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-300 rounded hover:bg-green-100 transition-colors"
                                            disabled={loading}
                                        >
                                            Resume
                                        </button>
                                    )}
                                    {['ACTIVE', 'PAUSED'].includes(transfer.status) && (
                                        <button
                                            onClick={() => handleDelete(transfer._id)}
                                            className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-300 rounded hover:bg-red-100 transition-colors"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {transfers.length === 0 && !loading && (
                        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg py-12 px-4">
                            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No recurring transfers</h3>
                            <p className="text-gray-500 mb-4">You haven't set up any outgoing recurring transfers yet.</p>
                            <Button onClick={() => setShowForm(true)}>Schedule Your First Transfer</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}