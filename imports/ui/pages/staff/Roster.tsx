import { useState } from "react";
import { Button } from "../../components/interaction/Button";
import { Modal } from "../../components/Modal";
import { PublishShiftForm } from "../../components/PublishShiftForm";
import { RosterTable } from "../../components/RosterTable";

export const RosterPage = () => {
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <Button onClick={() => setShiftModalOpen(true)}>Publish Shift</Button>
      <Modal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)}>
        <PublishShiftForm />
      </Modal>
      <RosterTable />
    </div>
  );
};
