import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, BookOpen, Calendar, BarChart3, PieChart, Download, Filter } from 'lucide-react';
import { Analytics } from '../types';

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
          <p className="text-gray-600">Track performance and business metrics</p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.total)}</p>
              <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.bookings.total}</p>
              <p className="text-sm text-blue-600 mt-1">{analytics.bookings.confirmed} confirmed</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fill Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics.bookings.fillRate)}</p>
              <p className="text-sm text-purple-600 mt-1">Capacity utilization</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.courses.active}</p>
              <p className="text-sm text-orange-600 mt-1">of {analytics.courses.total} total</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Program */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Program</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.revenue.byProgram).map(([program, revenue]) => {
              const percentage = (revenue / analytics.revenue.total) * 100;
              return (
                <div key={program}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{program}</span>
                    <span className="text-sm text-gray-600">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Popular Courses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Most Popular Courses</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {analytics.courses.mostPopular.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{(course as any).bookingCount || 0}</p>
                  <p className="text-sm text-gray-600">bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Month */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">Revenue</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">Bookings</button>
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries(analytics.revenue.byMonth).map(([month, revenue]) => {
            const maxRevenue = Math.max(...Object.values(analytics.revenue.byMonth));
            const percentage = (revenue / maxRevenue) * 100;
            
            return (
              <div key={month}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{month}</span>
                  <span className="text-sm text-gray-600">{formatCurrency(revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Refunds & Cancellations</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Refunds</span>
              <span className="font-semibold">{analytics.refunds.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Refund Amount</span>
              <span className="font-semibold text-red-600">{formatCurrency(analytics.refunds.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Refund Rate</span>
              <span className="font-semibold">
                {formatPercentage((analytics.refunds.total / analytics.bookings.total) * 100)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Impact</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Discounts Used</span>
              <span className="font-semibold">{analytics.discounts.totalUsed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Discount</span>
              <span className="font-semibold text-orange-600">{formatCurrency(analytics.discounts.totalDiscount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Discount</span>
              <span className="font-semibold">
                {analytics.discounts.totalUsed > 0 
                  ? formatCurrency(analytics.discounts.totalDiscount / analytics.discounts.totalUsed)
                  : '$0.00'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Revenue/Course</span>
              <span className="font-semibold">
                {formatCurrency(analytics.courses.active > 0 ? analytics.revenue.total / analytics.courses.active : 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Conversion</span>
              <span className="font-semibold text-green-600">
                {formatPercentage((analytics.bookings.confirmed / analytics.bookings.total) * 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Booking Value</span>
              <span className="font-semibold">
                {formatCurrency(analytics.bookings.confirmed > 0 ? analytics.revenue.total / analytics.bookings.confirmed : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};