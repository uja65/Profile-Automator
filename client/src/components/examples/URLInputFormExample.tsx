import URLInputForm from "../URLInputForm";

export default function URLInputFormExample() {
  return (
    <URLInputForm
      onSubmit={(url) => console.log("Submitted URL:", url)}
      isLoading={false}
    />
  );
}
