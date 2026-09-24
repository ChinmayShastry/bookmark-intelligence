import { PrivacyContent } from '../privacy/PrivacyContent';

export function PrivacyCenterView() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-8">
      <PrivacyContent />
    </div>
  );
}
