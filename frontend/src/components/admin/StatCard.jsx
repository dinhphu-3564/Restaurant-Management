function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-[#eadfcd] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-semibold">{title}</p>
          <h3 className="text-3xl font-black text-primary mt-2">{value}</h3>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
