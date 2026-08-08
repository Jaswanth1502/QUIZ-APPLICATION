type Props = {
  page:number;
  total?:number;
  totalPages?:number;
  onChange?:(page:number)=>void;
  onPage?:(page:number)=>void;
};
export function Pagination({page,total,totalPages,onChange,onPage}:Props) {
  const count = totalPages ?? total ?? 0;
  const change = onPage ?? onChange ?? (() => undefined);
  if (count <= 1) return null;
  return <div className="mt-6 flex justify-center gap-3">
    <button className="btn btn-secondary" disabled={page <= 0} onClick={() => change(page-1)}>Previous</button>
    <span className="self-center text-sm">Page {page+1} of {count}</span>
    <button className="btn btn-secondary" disabled={page >= count-1} onClick={() => change(page+1)}>Next</button>
  </div>;
}
export default Pagination;
