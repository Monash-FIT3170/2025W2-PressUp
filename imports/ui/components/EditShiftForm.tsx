import { FormEventHandler, useState, useEffect } from "react";
import { Button } from "./interaction/Button";
import { Form } from "./interaction/form/Form";
import { Input, Label } from "./interaction/Input";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Select } from "./interaction/Select";
import { Shift } from "../../api/shifts/ShiftsCollection";

interface EditShiftFormProps {
  shift: Shift;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditShiftForm = ({
  shift,
  onSuccess,
  onCancel,
}: EditShiftFormProps) => {
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [userId, setUserId] = useState("");

  // Initialize form with shift data
  useEffect(() => {
    if (shift) {
      setUserId(shift.user);

      // Format dates for datetime-local input (avoid timezone issues)
      const startDate = new Date(shift.start);
      const endDate = shift.end ? new Date(shift.end) : new Date();

      // Convert to local timezone for display
      const formatForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setStartDateTime(formatForInput(startDate));
      setEndDateTime(formatForInput(endDate));
    }
  }, [shift]);

  useSubscribe("users");
  const users = useTracker(
    () =>
      Meteor.users
        .find(
          {},
          {
            fields: { "profile.firstName": 1, "profile.lastName": 1 },
            sort: { "profile.firstName": 1 },
          },
        )
        .fetch() ?? [],
  );

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    // Parse datetime-local input values correctly (they're in local timezone)
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    Meteor.call(
      "shifts.edit",
      {
        shiftId: shift._id,
        userId,
        start,
        end,
      },
      (error: Meteor.Error | undefined, result: string | undefined) => {
        if (error) {
          console.error("Error editing shift:", error.reason || error.message);
          if (error.reason) alert(error.reason);
          else alert("An unexpected error occurred.");
          return;
        }
        console.log("Shift edited successfully:", result);
        onSuccess();
      },
    );
  };

  const onDelete = () => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      Meteor.call(
        "shifts.delete",
        { shiftId: shift._id },
        (error: Meteor.Error | undefined, result: string | undefined) => {
          if (error) {
            console.error(
              "Error deleting shift:",
              error.reason || error.message,
            );
            if (error.reason) alert(error.reason);
            else alert("An unexpected error occurred.");
            return;
          }
          console.log("Shift deleted successfully:", result);
          onSuccess();
        },
      );
    }
  };

  return (
    <Form title="Edit Shift" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <Label>Name</Label>
          <Select
            placeholder="--Select user--"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          >
            {users.map((user, i) => (
              <option value={user._id} key={i}>
                {`${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim() ||
                  user.username ||
                  "Unknown"}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Start Time</Label>
          <Input
            value={startDateTime}
            type="datetime-local"
            onChange={(e) => setStartDateTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>End Time</Label>
          <Input
            value={endDateTime}
            type="datetime-local"
            onChange={(e) => setEndDateTime(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-2 p-4 w-2/3 self-center">
          <Button type="submit" width="full">
            Save Changes
          </Button>
          <Button
            type="button"
            variant="negative"
            onClick={onDelete}
            width="full"
          >
            Delete Shift
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            width="full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Form>
  );
};
