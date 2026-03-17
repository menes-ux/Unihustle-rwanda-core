"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const growthData = [
  { month: 'Oct', spend: 120, hires: 2 },
  { month: 'Nov', spend: 250, hires: 4 },
  { month: 'Dec', spend: 180, hires: 3 },
  { month: 'Jan', spend: 400, hires: 6 },
  { month: 'Feb', spend: 550, hires: 8 },
  { month: 'Mar', spend: 890, hires: 12 },
];

export default function BusinessAnalytics() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Your Hustle Impact</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Investment</h3>
          <p className="text-3xl font-bold mt-2">$2,410</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Students Hired</h3>
          <p className="text-3xl font-bold mt-2">35</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Est. Agency Savings</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">+$8,500</p>
        </div>
      </div>

      {/* The Recharts Graph */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Investment Growth Over Time</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="spend" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}