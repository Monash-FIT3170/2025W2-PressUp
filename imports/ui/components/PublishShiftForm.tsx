import { FormEventHandler, useState } from "react";
import { Button } from "./interaction/Button";
import { Form } from "./interaction/form/Form";
import { Input, Label } from "./interaction/Input";

interface PublishShiftFormProps {}

export const PublishShiftForm = ({}: PublishShiftFormProps) => {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [user, setuser] = useState("");

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    console.log(startTime);
    console.log(endTime);
    console.log(user);
  };

  return (
    <Form title="Publish Shift" onSubmit={onSubmit}>
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
