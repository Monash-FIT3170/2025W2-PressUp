import { FormEventHandler, useState } from "react";
import { Button } from "./interaction/Button";
import { Form } from "./interaction/form/Form";
import { Input, Label } from "./interaction/Input";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Select } from "./interaction/Select";

interface PublishShiftFormProps {
  onSuccess: () => void;
}

export const PublishShiftForm = ({ onSuccess }: PublishShiftFormProps) => {
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [userId, setUserId] = useState("");

  useSubscribe("users");
  const users = useTracker(
    () => Meteor.users.find({}, { sort: { username: 1 } }).fetch() ?? [],
  );

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    const shiftDate = new Date(`${date}T00:00:00`);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    Meteor.call(
      "shifts.new",
      {
        userId,
        date: shiftDate,
        start: { hour: startHour, minute: startMinute },
        end: { hour: endHour, minute: endMinute },
      },
      (error: Meteor.Error | undefined, result: string | undefined) => {
        if (error) {
          console.error("Error creating shift:", error.reason || error.message);
          if (error.reason) alert(error.reason);
          else alert("An unexpected error occurred.");
          return;
        }
        console.log("Shift created with ID:", result);
        onSuccess();
        setDate("");
        setStartTime("");
        setEndTime("");
        setUserId("");
      },
    );
  };

  return (
    <Form title="Publish Shift" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <Label>User</Label>
          <Select
            placeholder="--Select user--"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          >
            {users.map((user, i) => (
              <option value={user._id} key={i}>
                {user.username}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input
            value={date}
            type="date"
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Start</Label>
          <Input
            value={startTime}
            type="time"
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>End</Label>
          <Input
            value={endTime}
            type="time"
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <div className="p-4 w-2/3 self-center">
          <Button type="submit" width="full">
            Publish
          </Button>
        </div>
      </div>
    </Form>
  );
};
