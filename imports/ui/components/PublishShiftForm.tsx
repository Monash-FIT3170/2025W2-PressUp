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
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [userId, setUserId] = useState("");

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

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    Meteor.call(
      "shifts.schedule",
      {
        userId,
        start,
        end,
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
        setStartDateTime("");
        setEndDateTime("");
        setUserId("");
      },
    );
  };

  return (
    <Form title="Publish Shift" onSubmit={onSubmit}>
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
        <div className="p-4 w-2/3 self-center">
          <Button type="submit" width="full">
            Publish
          </Button>
        </div>
      </div>
    </Form>
  );
};
