import { Metadata } from 'next';
import MarketplaceClient from '@/components/pages/MarketplaceClient';
import {
  generateDirectoryMetadata,
  generateDirectoryJsonLd,
  DirectorySearchParams,
} from '@/lib/seo/directoryMetadata';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: DirectorySearchParams;
}): Promise<Metadata> {
  return generateDirectoryMetadata(searchParams, '/vendors');
}

export default function VendorsPage({
  searchParams = {},
}: {
  searchParams?: DirectorySearchParams;
}) {
  const jsonLd = generateDirectoryJsonLd(searchParams, '/vendors');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketplaceClient />
    </>
  );
}
