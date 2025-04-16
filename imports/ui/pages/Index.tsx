import React from "react";
import { Hello } from "../components/Hello";
import { Info } from "../components/Info";

export const Index = () => (
  <div>
    <h1 className="text-2xl text-sky-500">Welcome to Meteor!</h1>
    <Hello />
    <Info />
  </div>
)
