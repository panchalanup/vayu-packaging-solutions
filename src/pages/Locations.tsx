import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { MetaTags, StructuredData } from "@/seo";
import { PAGE_METADATA } from "@/seo/metadata/pages";
import { getBreadcrumbSchema, getFAQSchema, PAGE_BREADCRUMBS } from "@/seo/schema";

const gujaratCities = [
  {
    name: "Ahmedabad",
    focus: "E-commerce, engineering, FMCG",
    problem: "High dispatch volume with strict delivery timelines",
    solution: "Planned bulk dispatches from our Ahmedabad hub with reliable 3-ply to 7-ply supply continuity.",
  },
  {
    name: "Surat",
    focus: "Textile, apparel, export",
    problem: "Transit scuffing and moisture exposure in logistics",
    solution: "Stronger corrugated board combinations and protective packaging materials to reduce shipment losses.",
  },
  {
    name: "Vadodara",
    focus: "Industrial manufacturing, chemicals",
    problem: "Need for heavy-duty cartons for warehouse and intercity movement",
    solution: "5-ply and 7-ply solutions designed for higher stacking and compression strength.",
  },
  {
    name: "Rajkot",
    focus: "Auto components, machinery",
    problem: "Frequent handling points causing edge crush failures",
    solution: "Board specification optimization with recommended bursting strength and better load bearing.",
  },
  {
    name: "Gandhinagar & Mehsana",
    focus: "Consumer goods and distribution",
    problem: "Inconsistent packaging quality from multiple vendors",
    solution: "Single-vendor quality consistency across boxes, tapes, stretch film, and strapping materials.",
  },
  {
    name: "Bhavnagar, Jamnagar, Morbi, Vapi, Himmatnagar, Modasa",
    focus: "Regional industrial and trading clusters",
    problem: "Need for predictable replenishment cycles in growing markets",
    solution: "Scheduled supply planning with city-wise support from our Gujarat distribution network.",
  },
];

const locationFAQs = [
  {
    question: "Which Gujarat cities does Vayu Packaging currently serve?",
    answer:
      "We currently serve Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, Mehsana, Bhavnagar, Jamnagar, Morbi, Vapi, Himmatnagar, and Modasa with packaging distribution support.",
  },
  {
    question: "Can I get bulk corrugated boxes delivered outside Ahmedabad in Gujarat?",
    answer:
      "Yes. Ahmedabad is our central operational hub, and we support bulk deliveries across major Gujarat cities based on order quantity, box specification, and dispatch schedule.",
  },
  {
    question: "Do you help choose packaging strength based on shipment risk?",
    answer:
      "Yes. We help businesses choose 3-ply, 5-ply, or 7-ply box specifications based on product weight, handling conditions, stacking, and transit distance.",
  },
];

const Locations = () => {
  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.locations} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.locations)} />
      <StructuredData type="FAQPage" data={getFAQSchema(locationFAQs)} />

      <PageTransition>
        <section className="pt-10 pb-16 section-dark">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">Gujarat Service Area</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Packaging Distribution Network in Gujarat
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Vayu Packaging supports businesses across key Gujarat markets with corrugated boxes, tapes, stretch films,
              bubble wraps, and related packaging consumables. We focus on reducing transit damage, maintaining supply
              consistency, and supporting bulk dispatch timelines.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2">
              {gujaratCities.map((city) => (
                <article key={city.name} className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">{city.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="font-semibold text-foreground">Business focus:</span> {city.focus}
                  </p>
                  <p className="text-sm text-foreground mb-2">
                    <span className="font-semibold">Common challenge:</span> {city.problem}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Our approach:</span> {city.solution}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 section-dark">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need Packaging Support in Your City?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Share your product type, shipment volume, and delivery location. We will suggest the right board strength,
              material mix, and dispatch model for your requirement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/contact" className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all">
                Request City-Wise Quote
              </a>
              <a href="/services" className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-all">
                Explore Packaging Services
              </a>
              <a href="/products" className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-all">
                View Product Categories
              </a>
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Locations;
