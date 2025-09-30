import { useEffect, useState } from "react";
import { Button } from "../../components/interaction/Button";
import { Modal } from "../../components/Modal";
import { PublishShiftForm } from "../../components/PublishShiftForm";
import { RosterTable, RosterStaff } from "../../components/RosterTable";
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
import { getHighestRole } from "/imports/helpers/roles";
import { getDayOfWeek, DayOfWeek } from "/imports/helpers/date";
import { WeekNavigation } from "../../components/WeekNavigation";

export const RosterPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Staff Management - Roster");
  }, [setPageTitle]);

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [showShiftModalCloseConfirmation, setShowShiftModalCloseConfirmation] =
    useState(false);

  // Week navigation
  const [selectedWeek, setSelectedWeek] = useState(() =>
    getDayOfWeek(new Date(), DayOfWeek.MONDAY),
  );
  const weekStart = selectedWeek;
  const weekEnd = (() => {
    const sunday = new Date(selectedWeek);
    sunday.setDate(selectedWeek.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  })();

  const onCloseShiftModalConfirm = () => {
    setShiftModalOpen(false);
    setShowShiftModalCloseConfirmation(false);
  };

  const canPublishShifts = useTracker(
    () => Roles.userIsInRole(Meteor.userId(), [RoleEnum.MANAGER]),
    [],
  );

  useSubscribe("shifts.all");
  useSubscribe("users.all");

  const { user, clockedIn } = useTracker(() => {
    const userId = Meteor.userId();

    const clockedIn = userId
      ? (ShiftsCollection.find({
          user: userId,
          status: ShiftStatus.CLOCKED_IN,
        }).fetch()[0] ?? null)
      : null;

    return {
      user: Meteor.user(),
      clockedIn,
    };
  }, []);

  const staff = useTracker(() => {
    const staffMap = new Map<string, Omit<RosterStaff, "id">>();

    Meteor.users
      .find({})
      .fetch()
      .forEach((user) => {
        staffMap.set(user._id, {
          name:
            `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim() ||
            user.username ||
            "Unknown",
          role: getHighestRole(user._id),
          shifts: [],
        });
      });

    ShiftsCollection.find({}, { sort: { start: 1 } }).forEach((shift) => {
      if (!staffMap.has(shift.user)) {
        staffMap.set(shift.user, { name: "Unknown", role: "", shifts: [] });
      }
      staffMap.get(shift.user)!.shifts.push(shift);
    });

    return Array.from(staffMap.entries()).map(([id, staff]) => ({
      id,
      ...staff,
    }));
  }, []);

  const clockIn = () => {
    Meteor.call("shifts.clockIn", (error: Meteor.Error | undefined) => {
      if (error) {
        console.error("Clock in failed:", error.message);
        alert(`Clock in failed: ${error.message}`);
      } else {
        console.log("Successfully clocked in");
      }
    });
  };

  const clockOut = () => {
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
    <div className="flex flex-col h-full">
      {/* Roster Controls */}
      <div className="p-5 shrink-0">
        <div className="flex justify-between items-center">
          {/* Week Navigation */}
          <WeekNavigation
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
          />

          {/* Clock In/Out and Publish Shift */}
          <div className="flex gap-2">
            <Hide hide={!user}>
              {clockedIn ? (
                <Button variant="negative" onClick={clockOut}>
                  Clock Out
                </Button>
              ) : (
                <Button variant="positive" onClick={clockIn}>
                  Clock In
                </Button>
              )}
            </Hide>
            <Hide hide={!canPublishShifts}>
              <Button onClick={() => setShiftModalOpen(true)}>
                Publish Shift
              </Button>
            </Hide>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="flex-1 min-h-0 px-5 pb-5">
        <RosterTable staff={staff} start={weekStart} end={weekEnd} />
      </div>

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
