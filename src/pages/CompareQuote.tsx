import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { InputForm } from "@/components/CompareQuote/InputForm";
import { ResultsOverview } from "@/components/CompareQuote/ResultsOverview";
import { loadPackagingData, getUniqueCategories, getUniqueTransportTypes } from "@/lib/csvParser";
import { matchAndScoreOptions } from "@/lib/matchingEngine";
import { PackagingOption, UserInput, ScoredResult } from "@/types/packaging";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import MetaTags from "@/components/SEO/MetaTags";
import StructuredData from "@/components/SEO/StructuredData";
import { motion } from "framer-motion";
import { PAGE_METADATA } from "@/seo/metadata/pages";
import { getSoftwareApplicationSchema, getToolFAQSchema } from "@/seo/schema";

export default function CompareQuote() {
  const [data, setData] = useState<PackagingOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [transportTypes, setTransportTypes] = useState<string[]>([]);
  const [results, setResults] = useState<ScoredResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const packagingData = await loadPackagingData();
        setData(packagingData);
        setCategories(getUniqueCategories(packagingData));
        setTransportTypes(getUniqueTransportTypes(packagingData));
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load packaging data. Please refresh the page.");
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (input: UserInput) => {
    setIsSearching(true);
    setHasSearched(true);

    // Simulate processing delay for better UX
    setTimeout(() => {
      const matches = matchAndScoreOptions(data, input);
      setResults(matches);
      setIsSearching(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }, 800);
  };

  const toolMeta = PAGE_METADATA.packagingFinder;

  return (
    <Layout>
      <PageTransition>
        <MetaTags
          title={toolMeta.title}
          description={toolMeta.description}
          keywords={toolMeta.keywords}
          canonical="https://vayupackaging.com/compare-quote"
        />
        <StructuredData schema={getSoftwareApplicationSchema()} />
        <StructuredData schema={getToolFAQSchema()} />

        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-16 md:py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto text-center"
              >
                <div className="inline-block mb-4">
                  <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    💡 Free Advisory Tool
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Find Your Perfect Packaging Solution
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                  Smart recommendations from 1500+ packaging options. Get expert-verified results instantly and share with your supplier for final confirmation.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Main Content */}
          <section className="container mx-auto px-4 py-12 max-w-7xl">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-[600px] w-full rounded-lg" />
              </div>
            ) : (
              <div className="space-y-12">
                {/* Input Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <InputForm
                    categories={categories}
                    transportTypes={transportTypes}
                    onSubmit={handleSearch}
                    isLoading={isSearching}
                  />
                </motion.div>

                {/* Results Section */}
                {hasSearched && (
                  <motion.div
                    id="results-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isSearching ? (
                      <div className="space-y-6">
                        <div className="text-center py-12">
                          <div className="inline-block">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          </div>
                          <p className="mt-4 text-muted-foreground">Analyzing options...</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Disclaimer Alert */}
                        <Alert className="mb-6 border-primary/20 bg-primary/5">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <AlertTitle className="text-primary font-semibold">📋 Important Advisory</AlertTitle>
                          <AlertDescription className="text-gray-700 mt-2">
                            <p className="mb-3">
                              These recommendations are based on our extensive database of 1500+ packaging solutions and serve as a helpful starting point for your packaging decisions.
                            </p>
                            <p className="font-medium mb-2">For optimal results, we strongly recommend:</p>
                            <ul className="list-none space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>Sharing these recommendations with your packaging supplier or manufacturer</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>Verifying specifications against your specific requirements</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>Conducting sample testing before placing bulk orders</span>
                              </li>
                            </ul>
                            <p className="mt-3 text-sm">
                              <strong>Need expert guidance?</strong> Our team is here to help! Contact us at <a href="tel:+918511658600" className="text-primary hover:underline font-semibold">+91 85116 58600</a>
                            </p>
                          </AlertDescription>
                        </Alert>
                        
                        <div className="mb-6">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Your Recommendations
                          </h2>
                          <p className="text-muted-foreground mt-2">
                            Top packaging solutions matched to your requirements
                          </p>
                        </div>
                        <ResultsOverview results={results} input={results[0] ? {
                          product_name: results[0].product_category,
                          quantity: 50,
                          fragility: results[0].fragility_level,
                          transport_type: results[0].transport_type,
                          priority: 'balanced'
                        } : { product_name: '', quantity: 0, fragility: 'Unknown', transport_type: '', priority: 'balanced' }} />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Info Section */}
                {!hasSearched && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid md:grid-cols-3 gap-6 mt-12"
                  >
                    <div className="text-center p-6 rounded-lg bg-card border">
                      <div className="text-3xl font-bold text-primary mb-2">1500+</div>
                      <p className="text-sm text-muted-foreground">Packaging Solutions</p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-card border">
                      <div className="text-3xl font-bold text-primary mb-2">3</div>
                      <p className="text-sm text-muted-foreground">Top Recommendations</p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-card border">
                      <div className="text-3xl font-bold text-primary mb-2">Instant</div>
                      <p className="text-sm text-muted-foreground">Quote Generation</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        </div>
      </PageTransition>
    </Layout>
  );
}
