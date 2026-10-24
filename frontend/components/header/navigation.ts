export const getCategoryUrl = (slug: string, selectedCity?: string) => {
  const params = new URLSearchParams();
  if (slug && slug !== 'all') params.set('category', slug);
  if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
  const qs = params.toString();
  return qs ? `/marketplace?${qs}` : '/marketplace';
};

export const getOccasionUrl = (slug: string, selectedCity?: string) => {
  const params = new URLSearchParams();
  if (slug && slug !== 'all') params.set('occasion', slug);
  if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
  const qs = params.toString();
  return qs ? `/marketplace?${qs}` : '/marketplace';
};
