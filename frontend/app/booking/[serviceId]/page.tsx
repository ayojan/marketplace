import ProtectedRoute from '../../../components/ProtectedRoute';
import BookingFlow from '../../../components/pages/BookingFlow';

export const metadata = {
  title: 'Book Service | Ayoj',
  description: 'Complete your secure booking with verified event professionals on Ayoj',
};

export default function BookingPage({ params }) {
  return (
    <ProtectedRoute requiredRole="customer">
      <BookingFlow params={params} />
    </ProtectedRoute>
  );
}