import { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Button } from "../../components/interaction/Button";
import { Modal } from "../../components/Modal";
import { PublishShiftForm } from "../../components/PublishShiftForm";
import { RosterTable } from "../../components/RosterTable";
import { ShiftsCollection } from "/imports/api/shifts/ShiftsCollection";

export const RosterPage = () => {
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  const { user, activeShift, isLoading } = useTracker(() => {
    const user = Meteor.user();
    const userId = Meteor.userId();
    
    if (!userId) {
      return { user: null, activeShift: null, isLoading: false };
    }

    const shiftsHandle = Meteor.subscribe('shifts.current');
    
    const activeShift = ShiftsCollection.findOne({
      user: userId,
      
    });

    return {
      user,
      activeShift,
      isLoading: !shiftsHandle.ready()
    };
  }, []);

  const isClockedIn = !!activeShift;

  const handleClockIn = () => {
    if (!user) return;
    
    Meteor.call('shifts.clockIn', (error: Meteor.Error | undefined) => {
      if (error) {
        console.error('Clock in failed:', error.message);
      } else {
        console.log('Successfully clocked in');
      }
    });
  };

  const handleClockOut = () => {
    if (!user || !activeShift) return;
    
    Meteor.call('shifts.clockOut', activeShift._id, (error: Meteor.Error | undefined) => {
      if (error) {
        console.error('Clock out failed:', error.message);
      } else {
        console.log('Successfully clocked out');
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header section with buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setShiftModalOpen(true)}>
          Publish Shift
        </Button>
        
        <div className="flex gap-2">
          {user && (
            <>
              {isClockedIn ? (
                <Button 
                  variant="negative" 
                  onClick={handleClockOut}

                >
                  Clock Out
                </Button>
              ) : (
                <Button 
                  variant="positive" 
                  onClick={handleClockIn}

                >
                  Clock In
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)}>
        <PublishShiftForm />
      </Modal>
      <RosterTable />
    </div>
  );
};