export const COMPARE_COPY = {
  floatingDock: {
    basketTitle: (count: number, max: number = 3) => `Inquiry Basket (${count}/${max})`,
    clearAll: 'Clear all',
    inquireAll: (count: number) => `Inquire All (${count})`,
    inquireMobile: (count: number) => `Inquire (${count})`,
    compareButton: 'Compare',
  },
  modalTable: {
    badge: 'Side-by-Side Comparison',
    title: (count: number) =>
      `Comparing ${count} Creative ${count === 1 ? 'Partner' : 'Partners'}`,
    clearSelection: 'Clear selection',
    tip: 'Tip: Compare verified reviews, published pricing, and portfolios before sending an inquiry.',
    inquireAll: (count: number) => `Inquire All (${count})`,
    close: 'Close',
  },
  vendorColumn: {
    clientRatingLabel: 'Client Rating',
    newPartner: 'New partner',
    startingPackageLabel: 'Starting Package',
    onRequest: 'On request',
    locationHubLabel: 'Location Hub',
    multipleLocations: 'Multiple Cities / Nationwide',
    standardLabel: 'The Ayoj Standard',
    standardValue: '0% Markup · Direct Chat',
    viewProfile: 'View Full Profile',
    directInquiry: 'Direct Inquiry',
  },
  inquiryModal: {
    badge: 'Multi-Vendor Inquiry Basket',
    titleWithCount: (count: number) =>
      `Inquire ${count} Shortlisted ${count === 1 ? 'Pro' : 'Pros'}`,
    titleBroadcast: 'Broadcast Celebration Inquiry',
    subtitle:
      'Send your celebration requirements once to get personalized quotes with 0% markup.',
    successTitle: 'Inquiries Sent Successfully!',
    successDescriptionWithCount: (count: number) =>
      `Your celebration details have been shared directly with ${count} creative partners. They will contact you shortly with customized proposals.`,
    successDescriptionBroadcast:
      'Your celebration details have been broadcast to top verified partners in your area. They will reach out shortly with customized proposals.',
    contactedProsLabel: 'Contacted Pros:',
    doneButton: 'Done & Continue Browsing',
    sendingToLabel: 'Sending inquiry to:',
    emptyBasketBadge: 'No specific pros selected yet',
    emptyBasketDescription:
      'You can click "Compare / Inquire" on any vendor card to add up to 3 pros to your basket, or submit your celebration details below to send a broadcast inquiry to top verified pros in your city!',
    dateLabel: 'Celebration Date',
    occasionLabel: 'Occasion / Milestone',
    guestsLabel: 'Expected Guests',
    cityLabel: 'City / Venue Area',
    cityPlaceholder: 'e.g. South Delhi, Gurgaon, Mumbai',
    visionLabel: 'Your Vision / Special Deliverables',
    visionPlaceholder:
      'Tell the pros about your schedule, style preferences (e.g. candid only, drone coverage, 2 day events)...',
    contactSectionTitle: 'Your Contact Information (for direct reply)',
    nameLabel: 'Full Name *',
    namePlaceholder: 'e.g. Ananya Sharma',
    phoneLabel: 'Phone / WhatsApp *',
    phonePlaceholder: '+91 98765 43210',
    emailLabel: 'Email (Optional)',
    emailPlaceholder: 'ananya@example.com',
    guaranteeText:
      'Zero middleman commission. Artists respond directly to your inquiry with transparent quotes.',
    cancelButton: 'Cancel',
    sendButtonWithCount: (count: number) =>
      `Send Inquiry to ${count} ${count === 1 ? 'Pro' : 'Pros'}`,
    sendButtonBroadcast: 'Send Broadcast Inquiry',
    sendingButton: 'Sending Inquiries...',
  },
} as const;
