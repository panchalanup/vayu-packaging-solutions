import { ScoredResult, UserInput } from "@/types/packaging";
import { ResultCard } from "./ResultCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsOverviewProps {
  results: ScoredResult[];
  input: UserInput;
}

export function ResultsOverview({ results, input }: ResultsOverviewProps) {
  if (results.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Matches Found</AlertTitle>
        <AlertDescription>
          We couldn't find packaging options matching your criteria. Try:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Relaxing weight or dimension constraints</li>
            <li>Selecting a different transport type</li>
            <li>Removing the maximum price constraint</li>
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Top {results.length} Recommendations Found</AlertTitle>
          <AlertDescription>
            Based on your requirements, we've identified the best packaging solutions. Compare
            them below and download supplier-ready specifications.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ResultCard result={result} input={input} />
          </motion.div>
        ))}
      </div>

      {/* Comparison Tip */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Need help choosing? Click "View Details" to see complete specifications and
          download options.
        </p>
      </div>
    </div>
  );
}
