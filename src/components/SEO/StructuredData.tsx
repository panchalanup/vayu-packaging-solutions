/**
 * StructuredData Component
 * Renders JSON-LD structured data for SEO
 */

import { Helmet } from 'react-helmet-async';
import { StructuredDataProps } from '@/types/seo';

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data, null, 2)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
