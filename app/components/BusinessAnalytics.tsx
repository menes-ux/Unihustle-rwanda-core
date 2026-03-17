export default function BusinessAnalytics() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Your Hustle Impact</h2>
      
      {/* Top Stat Cards */}
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
    </div>
  );
}