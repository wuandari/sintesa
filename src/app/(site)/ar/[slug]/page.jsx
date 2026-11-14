import { redirect } from 'next/navigation';

// Tautan lama /ar/<misi> → halaman Misi AR dengan misi itu terpilih.
export default async function MisiRedirect({ params }) {
  const { slug } = await params;
  redirect(`/ar?m=${encodeURIComponent(slug)}#misi`);
}
