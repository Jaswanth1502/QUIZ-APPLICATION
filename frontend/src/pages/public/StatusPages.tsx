import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return <Status code="403" title="Access denied"/>;
}
export function NotFoundPage() {
  return <Status code="404" title="Page not found"/>;
}
function Status({code,title}:{code:string;title:string}) {
  return <section className="container-page py-24 text-center">
    <p className="text-7xl font-black text-indigo-200">{code}</p>
    <h1 className="mt-3 text-3xl font-black">{title}</h1>
    <Link className="btn btn-primary mt-6" to="/">Return home</Link>
  </section>;
}
