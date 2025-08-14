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
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [userId, setUserId] = useState("");

  useSubscribe("users");
  const users = useTracker(
    () => Meteor.users.find({}, { sort: { username: 1 } }).fetch() ?? [],
  );

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    const start = new Date(startTime);
    const end = new Date(endTime);

    Meteor.call(
      "shifts.new",
      { userId, start, end },
      (error: Meteor.Error | undefined, result: string | undefined) => {
        if (error) {
          console.error("Error creating shift:", error.reason || error.message);
          if (error.reason) alert(error.reason);
          else alert("An unexpected error occurred.");
          return;
        }
        console.log("Shift created with ID:", result);
        onSuccess();
      },
    );
  };

  return (
    <Form title="Publish Shift" onSubmit={onSubmit}>
      <div>
        <Label>User</Label>
        <Select
          placeholder="--Select user--"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        >
          {users.map((user) => (
            <option value={user._id}>{user.username}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Start</Label>
        <Input
          value={startTime}
          type="datetime-local"
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>End</Label>
        <Input
          value={endTime}
          type="datetime-local"
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <div className="p-4 w-2/3 self-center">
        <Button type="submit" width="full">
          Publish
        </Button>
      </div>
    </Form>
  );
};
