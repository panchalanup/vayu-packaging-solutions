/**
 * Admin: "Designer enquiries" (#9). Lists "Send my design to Vayu" enquiries from the CRM sheet with preview,
 * spec, indicative estimate and a status the team updates (new -> contacted -> quoted -> won / lost).
 * The follow-up email is sent by Apps Script for enquiries still "new" after 48 hours.
 */

import { useEffect, useMemo, useState } from 'react';
import { Box, ExternalLink, MessageCircle, Phone, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDesignerEnquiries, isSafePreview, saveDesignerEnquiry } from '@/lib/admin-enquiries';
import { ENQUIRY_STATUSES, styleName, type DesignerEnquiry, type EnquiryStatus } from '@/lib/designerLeadSchema';

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: 'border-sky-200 bg-sky-50 text-sky-700',
  contacted: 'border-violet-200 bg-violet-50 text-violet-700',
  quoted: 'border-amber-200 bg-amber-50 text-amber-700',
  won: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  lost: 'border-slate-200 bg-slate-50 text-slate-500',
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};
const safeShareUrl = (url?: string) => (url && /^https?:\/\/[a-z0-9.:-]+\/box-designer#design=[A-Za-z0-9_-]+$/i.test(url) ? url : undefined);
const digits = (phone: string) => phone.replace(/\D/g, '').replace(/^0/, '').replace(/^(?!91)(\d{10})$/, '91$1');

export default function AdminDesignerEnquiries() {
  const [items, setItems] = useState<DesignerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | EnquiryStatus>('all');

  const load = async () => {
    setLoading(true);
    const rows = await getDesignerEnquiries();
    setFailed(rows === null);
    setItems(rows ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (e) =>
        (status === 'all' || e.status === status) &&
        (!q || [e.name, e.phone, e.email, e.place, e.id, e.spec.style].join(' ').toLowerCase().includes(q))
    );
  }, [items, query, status]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, 0])) as Record<EnquiryStatus, number>;
    items.forEach((e) => (c[e.status] += 1));
    return c;
  }, [items]);

  const changeStatus = async (enquiry: DesignerEnquiry, next: EnquiryStatus) => {
    setItems((list) => list.map((e) => (e.id === enquiry.id ? { ...e, status: next } : e)));
    if (await saveDesignerEnquiry(enquiry, { status: next })) toast.success(`Marked ${next}`);
    else {
      toast.error('Could not save to the sheet');
      setItems((list) => list.map((e) => (e.id === enquiry.id ? enquiry : e)));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit rounded-full border border-sky-200 bg-sky-50 text-sky-700">
              3D Box Designer
            </Badge>
            <CardTitle className="text-2xl text-slate-900">Designer enquiries</CardTitle>
            <CardDescription>
              Designs sent with "Send my design to Vayu". Prices shown are the customer's indicative estimate, not a quote.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', ...ENQUIRY_STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                  status === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s} {s === 'all' ? items.length : counts[s]}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, city, ID" className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <AdminPageLoader />
      ) : failed ? (
        <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Could not reach the CRM sheet. Check that the Apps Script is deployed with the "DesignerEnquiries" update
          (see the plan doc, section 4.B owner steps).
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-500">
          <Box className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          {items.length ? 'No enquiries match.' : 'No designer enquiries yet.'}
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((e) => {
            const link = safeShareUrl(e.shareUrl);
            return (
              <Card key={e.id} className="overflow-hidden border-slate-200 shadow-sm">
                <div className="flex gap-4 p-4">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {isSafePreview(e.preview) ? (
                      <img src={e.preview} alt={`Preview of enquiry ${e.id}`} className="h-full w-full object-contain" />
                    ) : (
                      <Box className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{e.name}</p>
                        <p className="text-xs text-slate-500">
                          {e.id} · {when(e.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className={`capitalize ${STATUS_STYLE[e.status]}`}>
                        {e.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700">
                      {styleName(e.spec.style)} · {e.spec.l} × {e.spec.w} × {e.spec.h} mm · {e.spec.ply} {e.spec.flutes}
                    </p>
                    <p className="text-sm text-slate-700">
                      {e.quantity.toLocaleString('en-IN')} boxes{e.place ? ` · ${e.place}` : ''}
                      {e.sample ? ' · sample requested' : ''}
                    </p>
                    {e.estimate && (
                      <p className="text-xs text-slate-500">
                        Customer saw {inr(e.estimate.low)}–{inr(e.estimate.high)} per box (indicative)
                      </p>
                    )}
                    {e.followUpSentAt && <p className="text-xs text-slate-500">Follow-up email sent {when(e.followUpSentAt)}</p>}
                  </div>
                </div>
                {e.note && <p className="border-t border-slate-100 px-4 py-2 text-sm text-slate-600">“{e.note}”</p>}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:+${digits(e.phone)}`}>
                      <Phone className="mr-1 h-3.5 w-3.5" /> {e.phone}
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`https://wa.me/${digits(e.phone)}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp
                    </a>
                  </Button>
                  {link && (
                    <Button asChild size="sm" variant="outline">
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open design
                      </a>
                    </Button>
                  )}
                  <div className="ml-auto w-36">
                    <Select value={e.status} onValueChange={(v) => void changeStatus(e, v as EnquiryStatus)}>
                      <SelectTrigger className="h-9 capitalize" aria-label={`Status of ${e.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENQUIRY_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
