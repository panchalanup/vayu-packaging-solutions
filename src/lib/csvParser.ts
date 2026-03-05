import Papa from 'papaparse';
import { PackagingOption } from '@/types/packaging';

let cachedData: PackagingOption[] | null = null;

export async function loadPackagingData(): Promise<PackagingOption[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/ToolData/advanced_packaging_recommendations_v2.csv');
    const csvText = await response.text();

    const result = Papa.parse<PackagingOption>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
    }

    cachedData = result.data.filter((row: any) => row.id && row.product_category);
    return cachedData;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw new Error('Failed to load packaging data');
  }
}

export function getUniqueCategories(data: PackagingOption[]): string[] {
  const categories = new Set(data.map(item => item.product_category));
  return Array.from(categories).sort();
}

export function getUniqueTransportTypes(data: PackagingOption[]): string[] {
  const types = new Set(data.map(item => item.transport_type));
  return Array.from(types).sort();
}
