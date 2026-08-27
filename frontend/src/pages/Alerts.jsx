import React from 'react';
import SectionTitle from '../components/common/SectionTitle';
import AlertsPanel from '../components/home/AlertsPanel';

export default function Alerts() {
  return (
    <div className="page">
      <SectionTitle
        title="Alerts & Notifications"
        subtitle="Monitor active hazards and system notifications."
      />
      <AlertsPanel />
    </div>
  );
}