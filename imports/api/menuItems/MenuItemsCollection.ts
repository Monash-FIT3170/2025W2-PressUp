import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export type BaseIngredient = {
  key: string; 
  label: string; 
  default: boolean;
  removable?: boolean;
  priceDelta?: number;
};

export type OptionGroup = {
  id: string;         
  label: string;      
  type: "single" | "multiple";
  required?: boolean;  
  options: Array<{
    key: string;       
    label: string;     
    priceDelta?: number; 
    default?: boolean;   
  }>;
};

export interface MenuItem extends DBEntry {
  name: string;
  quantity: number;
  ingredients: string[];
  available: boolean;
  price: number;
  category?: string[];
  allergens?: string[];
  image: string;
  discount?: number;
  baseIngredients?: BaseIngredient[]; 
  optionGroups?: OptionGroup[]; 
}

export const MenuItemsCollection = new Mongo.Collection<
  OmitDB<MenuItem>,
  MenuItem
>("menuItems");
