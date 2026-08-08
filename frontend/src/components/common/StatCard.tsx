export function StatCard({label, value}:{label:string; value:string|number}) {
  return (
    <div className="card h-[120px] p-6 flex flex-col justify-center">
      <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#5B7564]">{label}</p>
      <p className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b] mt-1">{value}</p>
    </div>
  );
}
export default StatCard;
