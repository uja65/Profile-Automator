import SourceTag from "../SourceTag";

export default function SourceTagExample() {
  return (
    <div className="space-y-2">
      <SourceTag platform="imdb" />
      <SourceTag platform="youtube" />
      <SourceTag platform="linkedin" />
    </div>
  );
}
