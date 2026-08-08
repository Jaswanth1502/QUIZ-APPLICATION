export function Loading({label = 'Loading…'}:{label?:string}) {
  return <div role="status" className="py-16 text-center text-slate-500">{label}</div>;
}
export default Loading;
