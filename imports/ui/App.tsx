import React from 'react';
import { Hello } from './Hello';
import { Info } from './Info';

export const App = () => (
  <div>
    <h1 class="text-2xl text-sky-500">Welcome to Meteor!</h1>
    <Hello />
    <Info />
  </div>
);
