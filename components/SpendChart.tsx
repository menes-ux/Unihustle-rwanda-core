"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SpendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${value}`} />
        <Tooltip cursor={{ fill: '#f3f4f6' }} />
        <Bar dataKey="spend" fill="#f97316" radius={[4, 4, 0, 0]} />
        <Bar dataKey="agency" fill="#9ca3af" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}