import { motion } from "framer-motion";
import { ArrowUpRight, Boxes, FileText, PackageCheck, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    title: "Total Inquiries",
    value: "128",
    change: "+12.4%",
    description: "Compared to last month",
    icon: Users,
  },
  {
    title: "Active Products",
    value: "42",
    change: "+6.1%",
    description: "Catalog currently promoted",
    icon: Boxes,
  },
  {
    title: "Quote Requests",
    value: "31",
    change: "+9.8%",
    description: "New packaging requests",
    icon: FileText,
  },
  {
    title: "Orders in Review",
    value: "17",
    change: "+4.3%",
    description: "Pending approval pipeline",
    icon: PackageCheck,
  },
];

const weeklyPerformance = [
  { label: "Mon", value: 64 },
  { label: "Tue", value: 78 },
  { label: "Wed", value: 71 },
  { label: "Thu", value: 88 },
  { label: "Fri", value: 93 },
  { label: "Sat", value: 57 },
  { label: "Sun", value: 49 },
];

const activities = [
  "3 new quote requests received from corrugated box buyers.",
  "Inventory catalog updated for kraft mailer packaging.",
  "Marketing team published a new packaging use-case article.",
  "Monthly inquiry conversion report generated successfully.",
];

const quickHighlights = [
  { label: "Today’s leads", value: "24", tone: "text-sky-700 bg-sky-50 border-sky-100" },
  { label: "Open quotes", value: "12", tone: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { label: "Conversion", value: "68%", tone: "text-violet-700 bg-violet-50 border-violet-100" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]"
      >
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                Admin overview
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back, Anup</h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  Here is a quick snapshot of inquiries, quotes, products, and operational activity across the admin portal.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickHighlights.map((item) => (
                <div key={item.label} className={`rounded-2xl border px-4 py-3 ${item.tone}`}>
                  <p className="text-xs font-medium uppercase tracking-[0.14em]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="grid h-full gap-4 p-6">
            <div>
              <p className="text-sm font-medium text-slate-900">Monthly summary</p>
              <p className="mt-1 text-sm text-slate-500">Performance overview for the current admin cycle.</p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Packaging inquiries</span>
                  <span className="text-sm font-semibold text-slate-900">+18%</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Approved quotes</span>
                  <span className="text-sm font-semibold text-slate-900">31</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Response time</span>
                  <span className="text-sm font-semibold text-slate-900">2.4 hrs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
          >
            <Card className="border-slate-200 bg-white text-slate-900 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription className="text-slate-500">{stat.title}</CardDescription>
                  <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</CardTitle>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-600">
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>{stat.change}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription className="text-slate-500">
                Simulated admin engagement and inquiry trend across the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-72 items-end gap-3">
                {weeklyPerformance.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex flex-1 flex-col items-center gap-3"
                    initial={{ opacity: 0, scaleY: 0.4 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.2 + index * 0.06, duration: 0.35 }}
                  >
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-sky-500 via-blue-400 to-indigo-400"
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="space-y-6"
        >
          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle>Pipeline Health</CardTitle>
              <CardDescription className="text-slate-500">Static status indicators for the current dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Lead response rate</span>
                  <span className="text-emerald-600">91%</span>
                </div>
                <Progress value={91} className="h-2 bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Quote completion</span>
                  <span className="text-sky-600">76%</span>
                </div>
                <Progress value={76} className="h-2 bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Fulfillment readiness</span>
                  <span className="text-violet-600">84%</span>
                </div>
                <Progress value={84} className="h-2 bg-slate-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-slate-500">Static sample updates for the admin home screen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((activity, index) => (
                <div key={activity} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm text-slate-700">{activity}</p>
                    <p className="mt-1 text-xs text-slate-500">{index + 1} hour ago</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default AdminDashboard;