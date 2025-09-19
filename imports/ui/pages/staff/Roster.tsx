import { useEffect, useState } from "react";
import { Button } from "../../components/interaction/Button";
import { Modal } from "../../components/Modal";
import { PublishShiftForm } from "../../components/PublishShiftForm";
import { RosterTable } from "../../components/RosterTable";
import {
  ShiftsCollection,
  ShiftStatus,
} from "/imports/api/shifts/ShiftsCollection";
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

  const canPublishShifts = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [],
  );

  useSubscribe("shifts.current");
  const { user, activeShift } = useTracker(() => {
    const userId = Meteor.userId();

    return {
      user: Meteor.user(),
      activeShift: userId
        ? ShiftsCollection.find({
            user: userId,
            status: ShiftStatus.CLOCKED_IN,
          }).fetch()[0]
        : null,
    };
  }, []);

  const handleClockIn = () => {
    Meteor.call("shifts.clockIn", (error: Meteor.Error | undefined) => {
      if (error) {
        console.error("Clock in failed:", error.message);
        alert(`Clock in failed: ${error.message}`);
      } else {
        console.log("Successfully clocked in");
      }
    });
  };

  const handleClockOut = () => {
    Meteor.call("shifts.clockOut", (error: Meteor.Error | undefined) => {
      if (error) {
        console.error("Clock out failed:", error.message);
        alert(`Clock out failed: ${error.message}`);
      } else {
        console.log("Successfully clocked out");
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <RosterTable
        controls={
          <>
            <Hide hide={!user}>
              {activeShift ? (
                <Button variant="negative" onClick={handleClockOut}>
                  Clock Out
                </Button>
              ) : (
                <Button variant="positive" onClick={handleClockIn}>
                  Clock In
                </Button>
              )}
            </Hide>
            <Hide hide={!canPublishShifts}>
              <Button onClick={() => setShiftModalOpen(true)}>
                Publish Shift
              </Button>
            </Hide>
          </>
        }
      />
      <Modal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)}>
        <PublishShiftForm onSuccess={() => setShiftModalOpen(false)} />
      </Modal>
      <ConfirmModal
        open={showShiftModalCloseConfirmation}
        message="Are you sure you want to discard your changes?"
        onConfirm={onCloseShiftModalConfirm}
        onCancel={() => setShowShiftModalCloseConfirmation(false)}
      />
    </div>
  );
};
