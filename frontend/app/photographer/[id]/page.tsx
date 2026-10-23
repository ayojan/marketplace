import { permanentRedirect } from 'next/navigation';

export default function PhotographerRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  permanentRedirect(`/vendors/${params.id}`);
}
