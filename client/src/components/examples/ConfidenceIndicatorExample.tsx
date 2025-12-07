import ConfidenceIndicator from "../ConfidenceIndicator";

export default function ConfidenceIndicatorExample() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm w-24">High:</span>
        <ConfidenceIndicator score={0.92} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm w-24">Medium:</span>
        <ConfidenceIndicator score={0.68} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm w-24">Low:</span>
        <ConfidenceIndicator score={0.45} />
      </div>
    </div>
  );
}
