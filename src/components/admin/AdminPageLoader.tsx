import { Loader2 } from "lucide-react";

type AdminPageLoaderProps = {
  title?: string;
  description?: string;
};

const AdminPageLoader = ({
  title = "Loading data...",
  description = "Please wait while we fetch the latest records from Google Sheets.",
}: AdminPageLoaderProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="mt-5 text-lg font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default AdminPageLoader;
