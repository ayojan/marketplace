export const CANCELLATION_POLICIES = [
  {
    name: 'Flexible',
    desc: 'Full refund for cancellations made up to 7 days before event date.',
  },
  {
    name: 'Moderate',
    desc: '50% refund for cancellations made up to 14 days before event date.',
  },
  {
    name: 'Strict',
    desc: 'Advance deposit is non-refundable within 30 days of the booked event.',
  }
];

export const NOTIFICATION_ITEMS = [
  {
    key: 'notify_email_bookings' as const,
    title: 'New Booking & Reservation Emails',
    desc: 'Receive immediate email notifications whenever a host books or inquires about a service.',
  },
  {
    key: 'notify_sms_bookings' as const,
    title: 'WhatsApp & SMS Urgent Alerts',
    desc: 'Instant ping on your registered mobile number for newly scheduled events.',
  },
  {
    key: 'notify_messages' as const,
    title: 'Direct Client Chat Messages',
    desc: 'Alerts when a client host leaves a message on your booking thread.',
  },
  {
    key: 'notify_marketing' as const,
    title: 'Ayoj Trend Insights & Event Guides',
    desc: 'Occasional seasonal market reports and pricing tips to optimize your revenue.',
  }
];
