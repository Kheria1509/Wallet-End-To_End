import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { BiBell, BiCheck, BiLoader } from 'react-icons/bi';

export const NotificationBell = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset visible count when panel closes
  useEffect(() => {
    if (!showNotifications) {
      setVisibleCount(4);
    }
  }, [showNotifications]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadMoreNotifications = () => {
    setLoading(true);
    // Simulate loading with timeout
    setTimeout(() => {
      setVisibleCount(prevCount => prevCount + 4);
      setLoading(false);
    }, 800);
  };

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
    // Here you can add navigation or other actions based on notification type
  };

  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMoreNotifications = notifications.length > visibleCount;

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 relative text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
        aria-label="Notifications"
      >
        <BiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center transform translate-x-1 -translate-y-1 font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-[32rem] overflow-hidden flex flex-col border border-gray-200 notification"
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          <div className="p-4 border-b sticky top-0 bg-white z-10 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <BiCheck className="mr-1 w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto divide-y divide-gray-100 flex-grow">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                No notifications yet
              </div>
            ) : (
              <>
                {visibleNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification._id)}
                  >
                    <div className={`text-sm ${!notification.read ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                      <span>{formatDate(notification.createdAt)}</span>
                      {!notification.read && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">New</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {hasMoreNotifications && (
            <div className="p-2 border-t bg-gray-50 sticky bottom-0">
              <button
                onClick={loadMoreNotifications}
                disabled={loading}
                className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <BiLoader className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (${notifications.length - visibleCount} more)`
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};