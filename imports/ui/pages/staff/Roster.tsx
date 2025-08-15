import { useEffect, useState } from "react";
import { Button } from "../../components/interaction/Button";
import { Modal } from "../../components/Modal";
import { PublishShiftForm } from "../../components/PublishShiftForm";
import { RosterTable } from "../../components/RosterTable";
import { ConfirmModal } from "../../components/ConfirmModal";
import { usePageTitle } from "../../hooks/PageTitleContext";

export const RosterPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Staff Management - Roster")
  }, [setPageTitle])

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [showShiftModalCloseConfirmation, setShowShiftModalCloseConfirmation] =
    useState(false);
  const onCloseShiftModalConfirm = () => {
    setShiftModalOpen(false);
    setShowShiftModalCloseConfirmation(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <Button onClick={() => setShiftModalOpen(true)}>Publish Shift</Button>
      <Modal
        open={shiftModalOpen}
        onClose={() => setShowShiftModalCloseConfirmation(true)}
      >
        <PublishShiftForm onSuccess={() => setShiftModalOpen(false)} />
      </Modal>
      <RosterTable />
      <ConfirmModal
        open={showShiftModalCloseConfirmation}
        message="Are you sure you want to discard your changes?"
        onConfirm={onCloseShiftModalConfirm}
        onCancel={() => setShowShiftModalCloseConfirmation(false)}
      />
    </div>
  );
};
