import CreateTournamentDialog from "../CreateTournamentDialog";
import { Button } from "@/components/ui/button";

export default function CreateTournamentDialogExample() {
  return (
    <div className="p-8 bg-background flex items-center justify-center">
      <CreateTournamentDialog
        trigger={<Button>Open Create Dialog</Button>}
        onSubmit={(data) => console.log("Tournament created:", data)}
      />
    </div>
  );
}
