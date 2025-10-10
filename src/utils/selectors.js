/**
 * selectors.js - Memoized State Selectors
 * 
 * This utility provides memoized selectors for efficient data access
 * and derived state calculations.
 */

import { useMemo } from 'react';

/**
 * Get jobs grouped by status
 * 
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Jobs grouped by status
 */
export const useJobsByStatus = (jobs) => {
  return useMemo(() => {
    if (!Array.isArray(jobs)) return {};
    
    return jobs.reduce((groups, job) => {
      if (!job || !job.status) return groups;
      
      return {
        ...groups,
        [job.status]: [...(groups[job.status] || []), job],
      };
    }, {});
  }, [jobs]);
};

/**
 * Get job statistics
 * 
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Job statistics
 */
export const useJobStats = (jobs) => {
  return useMemo(() => {
    if (!Array.isArray(jobs)) {
      return {
        newOrders: 0,
        accepted: 0,
        pickedup: 0,
        delivered: 0,
        total: 0,
        completionRate: 0,
      };
    }

    const stats = jobs.reduce((acc, job) => {
      if (!job || !job.status) return acc;
      
      switch (job.status) {
        case 'new':
        case 'new_order':
          acc.newOrders++;
          break;
        case 'accepted':
          acc.accepted++;
          break;
        case 'pickedup':
        case 'picked_up':
          acc.pickedup++;
          break;
        case 'delivered':
          acc.delivered++;
          break;
      }
      acc.total++;
      return acc;
    }, { newOrders: 0, accepted: 0, pickedup: 0, delivered: 0, total: 0 });

    return {
      ...stats,
      completionRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0,
    };
  }, [jobs]);
};

/**
 * Get unread notifications count
 * 
 * @param {Array} notifications - Array of notification objects
 * @returns {number} Number of unread notifications
 */
export const useUnreadNotificationsCount = (notifications) => {
  return useMemo(() => {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter(n => n && !n.read).length;
  }, [notifications]);
};

/**
 * Get sorted jobs by date
 * 
 * @param {Array} jobs - Array of job objects
 * @returns {Array} Sorted jobs
 */
export const useSortedJobs = (jobs) => {
  return useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    
    return [...jobs]
      .filter(job => job && job.dateTime)
      .sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime);
      });
  }, [jobs]);
};

/**
 * Get jobs grouped by date
 * 
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Jobs grouped by date
 */
export const useJobsByDate = (jobs) => {
  return useMemo(() => {
    if (!Array.isArray(jobs)) return {};
    
    return jobs
      .filter(job => job && job.dateTime)
      .reduce((groups, job) => {
        const date = new Date(job.dateTime).toLocaleDateString();
        return {
          ...groups,
          [date]: [...(groups[date] || []), job],
        };
      }, {});
  }, [jobs]);
};

/**
 * Get filtered and sorted jobs
 * 
 * @param {Array} jobs - Array of job objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered and sorted jobs
 */
export const useFilteredJobs = (jobs, filters = {}) => {
  return useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    
    return jobs
      .filter(job => {
        if (!job) return false;
        
        if (filters.status && job.status !== filters.status) return false;
        if (filters.type && job.type !== filters.type) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            (job.companyName && job.companyName.toLowerCase().includes(searchLower)) ||
            (job.orderId && job.orderId.toLowerCase().includes(searchLower)) ||
            (job.pickupLocation && job.pickupLocation.toLowerCase().includes(searchLower)) ||
            (job.dropoffLocation && job.dropoffLocation.toLowerCase().includes(searchLower))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (!a.dateTime || !b.dateTime) return 0;
        return new Date(b.dateTime) - new Date(a.dateTime);
      });
  }, [jobs, filters]);
};

/**
 * Get daily job statistics
 * 
 * @param {Array} jobs - Array of job objects
 * @returns {Array} Daily statistics
 */
export const useDailyStats = (jobs) => {
  return useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    
    const statsMap = jobs
      .filter(job => job && job.dateTime)
      .reduce((stats, job) => {
        const date = new Date(job.dateTime).toLocaleDateString();
        return {
          ...stats,
          [date]: {
            date,
            total: (stats[date]?.total || 0) + 1,
            completed: (stats[date]?.completed || 0) + (job.status === 'delivered' ? 1 : 0),
            efficiency: 0, // Will be calculated below
          },
        };
      }, {});

    // Calculate efficiency for each day
    return Object.values(statsMap).map(day => ({
      ...day,
      efficiency: day.total > 0 ? (day.completed / day.total) * 100 : 0,
    }));
  }, [jobs]);
};

/**
 * Get user performance metrics
 * 
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Performance metrics
 */
export const usePerformanceMetrics = (jobs) => {
  return useMemo(() => {
    if (!Array.isArray(jobs)) {
      return {
        avgCompletionTime: 0,
        onTimeDeliveryRate: 0,
        customerRating: 0,
        efficiency: 0,
      };
    }

    const total = jobs.length;
    const completed = jobs.filter(job => job && job.status === 'delivered').length;
    const onTime = jobs.filter(job => job && job.status === 'delivered' && !job.isLate).length;
    
    return {
      avgCompletionTime: completed > 0 ? 
        jobs.filter(job => job && job.completionTime)
            .reduce((sum, job) => sum + (job.completionTime || 0), 0) / completed : 0,
      onTimeDeliveryRate: completed > 0 ? (onTime / completed) * 100 : 0,
      customerRating: completed > 0 ?
        jobs.filter(job => job && job.rating)
            .reduce((sum, job) => sum + (job.rating || 0), 0) / completed : 0,
      efficiency: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [jobs]);
};