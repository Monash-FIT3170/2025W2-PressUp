import React, { useState } from "react";
import { MenuItem } from "/imports/api";

interface AllergenFilterProps {
  onFilterChange: (selectedOptions: string[]) => void;
  item: MenuItem;
}

export const AllergenFilter = ({ onFilterChange, item}: AllergenFilterProps ) => {
    const allergens = [""]
}