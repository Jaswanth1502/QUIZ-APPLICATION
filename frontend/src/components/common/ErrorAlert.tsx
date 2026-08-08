export function ErrorAlert({message}:{message:string}) {
  return message ? <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</div> : null;
}
export default ErrorAlert;
