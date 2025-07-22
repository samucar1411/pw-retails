import { IncidentForm } from "@/components/incident-form";

export default function NewIncidentPage() {
  return (
    <div className="flex min-h-screen p-4 md:p-6">
      <div className="flex-1 pr-4 md:pr-6 pb-24">
        <IncidentForm />
      </div>
    </div>
  );
}
