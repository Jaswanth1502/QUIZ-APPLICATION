export default function EmptyState({message="Nothing to display yet."}:{message?:string}) {
  return <div className="card p-10 text-center text-slate-500">{message}</div>;
}
