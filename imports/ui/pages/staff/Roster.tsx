import { useEffect, useState } from "react";
import { Button } from "../../components/interaction/Button";
import { Modal } from "../../components/Modal";
import { PublishShiftForm } from "../../components/PublishShiftForm";
import { RosterTable } from "../../components/RosterTable";
import { ConfirmModal } from "../../components/ConfirmModal";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { Hide } from "../../components/display/Hide";
import { Roles } from "meteor/alanning:roles";
import { Meteor } from "meteor/meteor";
import { RoleEnum } from "/imports/api/accounts/roles";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";

export const RosterPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Staff Management - Roster");
  }, [setPageTitle]);

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [showShiftModalCloseConfirmation, setShowShiftModalCloseConfirmation] =
    useState(false);
  const onCloseShiftModalConfirm = () => {
    setShiftModalOpen(false);
    setShowShiftModalCloseConfirmation(false);
  };

  const rolesLoaded = useSubscribe("users.roles")();
  const rolesGraphLoaded = useSubscribe("users.rolesGraph")();
  const canPublishShifts = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [rolesLoaded, rolesGraphLoaded],
  );

  return (
    <div className="flex flex-1 flex-col">
      <Modal
        open={shiftModalOpen}
        onClose={() => setShowShiftModalCloseConfirmation(true)}
      >
        <PublishShiftForm onSuccess={() => setShiftModalOpen(false)} />
      </Modal>
      <RosterTable
        PublishShiftButton={
          <Hide hide={!canPublishShifts}>
            <Button onClick={() => setShiftModalOpen(true)}>
              Publish Shift
            </Button>
          </Hide>
        }
      />
      <ConfirmModal
        open={showShiftModalCloseConfirmation}
        message="Are you sure you want to discard your changes?"
        onConfirm={onCloseShiftModalConfirm}
        onCancel={() => setShowShiftModalCloseConfirmation(false)}
      />
    </div>
  );
};
