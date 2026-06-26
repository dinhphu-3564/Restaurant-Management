function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-semibold">{title}</p>
          <h3 className="text-3xl font-black text-green-950 mt-2">{value}</h3>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center">
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
