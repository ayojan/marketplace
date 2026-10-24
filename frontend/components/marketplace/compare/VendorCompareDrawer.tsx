'use client';

import React, { useState } from 'react';
import { VendorCompareDrawerProps, CompareVendor } from './types';
import CompareFloatingDock from './CompareFloatingDock';
import CompareModalTable from './CompareModalTable';
import CompareInquiryModal from './CompareInquiryModal';

export default function VendorCompareDrawer({
  vendors = [],
  onRemove,
  onClear,
  onOpenInquire,
  isOpenInquireModal,
  onToggleInquireModal
}: VendorCompareDrawerProps) {
  const [isOpenCompareModal, setIsOpenCompareModal] = useState(false);
  const [internalInquireOpen, setInternalInquireOpen] = useState(false);

  const isInquireModalOpen =
    isOpenInquireModal !== undefined ? isOpenInquireModal : internalInquireOpen;

  const handleOpenInquire = () => {
    if (onToggleInquireModal) onToggleInquireModal(true);
    setInternalInquireOpen(true);
  };

  const handleCloseInquire = () => {
    if (onToggleInquireModal) onToggleInquireModal(false);
    setInternalInquireOpen(false);
  };

  // If both tray and inquiry modal have nothing to show, return null
  if ((!vendors || vendors.length === 0) && !isInquireModalOpen && !isOpenCompareModal) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Dock */}
      <CompareFloatingDock
        vendors={vendors}
        onRemove={onRemove}
        onClear={onClear}
        onOpenInquire={handleOpenInquire}
        onOpenModal={() => setIsOpenCompareModal(true)}
      />

      {/* Side-by-Side Comparison Matrix Modal */}
      <CompareModalTable
        isOpen={isOpenCompareModal}
        onClose={() => setIsOpenCompareModal(false)}
        vendors={vendors}
        onRemove={onRemove}
        onClear={onClear}
        onOpenInquireAll={handleOpenInquire}
        onOpenDirectInquire={onOpenInquire}
      />

      {/* Broadcast Multi-Vendor Inquiry Basket Modal */}
      <CompareInquiryModal
        isOpen={isInquireModalOpen}
        onClose={handleCloseInquire}
        vendors={vendors}
      />
    </>
  );
}
