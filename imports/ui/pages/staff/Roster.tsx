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

  const rolesLoaded = useSubscribe("users.roles")();
  const rolesGraphLoaded = useSubscribe("users.rolesGraph")();
  const canPublishShifts = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [rolesLoaded, rolesGraphLoaded],
  );

  const { user, activeShift } = useTracker(() => {
    const user = Meteor.user();
    const userId = Meteor.userId();

    if (!userId) {
      return { user: null, activeShift: null, isLoading: false };
    }

    const shiftsHandle = Meteor.subscribe("shifts.current");

    // Look for clocked-in shifts instead of just any active shift
    const activeShift = ShiftsCollection.findOne({
      user: userId,
      status: ShiftStatus.CLOCKED_IN,
    });

    return {
      user,
      activeShift,
      isLoading: !shiftsHandle.ready(),
    };
  }, []);

  const isClockedIn = !!activeShift;

  const handleClockIn = () => {
    if (!user) return;

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
    if (!user || !activeShift) return;

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
      {/* Header section with buttons */}
      <div className="flex justify-between items-center mb-4">
        {/* <Button onClick={() => setShiftModalOpen(true)}>Publish Shift</Button> */}

        <div className="flex gap-2">
          {user && (
            <>
              {isClockedIn ? (
                <Button variant="negative" onClick={handleClockOut}>
                  Clock Out
                </Button>
              ) : (
                <Button variant="positive" onClick={handleClockIn}>
                  Clock In
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)}>
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
