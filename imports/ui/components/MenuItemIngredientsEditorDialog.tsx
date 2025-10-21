import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  Divider,
  Box,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { Meteor } from "meteor/meteor";
import { MenuItem } from "/imports/api";
import AddIcon from "@mui/icons-material/Add";

type BaseIngredient = {
  key: string;
  label: string;
  default: boolean;
  removable?: boolean;
  priceDelta?: number;
};

type Option = {
  key: string;
  label: string;
  priceDelta?: number;
  default?: boolean;
};

type OptionGroup = {
  id: string;
  label: string;
  baseKey?: string;
  type: "single" | "multiple";
  required?: boolean;
  options: Option[];
};

type CanonicalMenuItem = MenuItem & {
  baseIngredients?: BaseIngredient[];
  optionGroups?: OptionGroup[];
};

type Props = {
  open: boolean;
  item: CanonicalMenuItem | null;
  onClose: () => void;
};

const MenuItemIngredientsEditorDialog: React.FC<Props> = ({ open, item, onClose }) => {
  const [baseIngredients, setBaseIngredients] = useState<BaseIngredient[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);

  useEffect(() => {
    if (item) {
      setBaseIngredients(item.baseIngredients ?? []);
      setOptionGroups(item.optionGroups ?? []);
    }
  }, [item?._id, open]);

  const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // replace spaces with hyphens
    .replace(/[^\w-]/g, "");    // remove all non-alphanumeric or hyphen characters

  const handleAddBase = () => {
    setBaseIngredients((prev) => [
      ...prev,
      { key: `base-${Date.now()}`, label: "", default: false, removable: true, priceDelta: 0 },
    ]);
  };

  const handleRemoveBase = (key: string) => {
    setBaseIngredients((prev) => prev.filter((b) => b.key !== key));
    setOptionGroups((prev) => prev.filter((g) => !g.id.startsWith(key + "-")));
  };

  const handleBaseChange = (key: string, field: keyof BaseIngredient, value: any) => {
    setBaseIngredients((prev) =>
      prev.map((b) => (b.key === key ? { ...b, [field]: value } : b)),
    );
  };

  const handleAddGroup = (baseKey?: string, label = "") => {
    const newId = slugify(label || `group-${Date.now()}`);
    setOptionGroups((prev) => [
      ...prev,
      { id: newId, label, type: "single", required: false, options: [] },
    ]);
  };

  const handleRemoveGroup = (id: string) => {
    setOptionGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const handleGroupChange = (id: string, field: keyof OptionGroup, value: any) => {
    setOptionGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleAddOption = (groupId: string) => {
    const newKey = `option-${Date.now()}`;
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: [...g.options, { key: newKey, label: "", default: false, priceDelta: 0 }] }
          : g
      )
    );
  };

  const handleRemoveOption = (groupId: string, optKey: string) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.filter((o) => o.key !== optKey) }
          : g,
      ),
    );
  };

  const handleOptionChange = (
    groupId: string,
    optKey: string,
    field: keyof Option,
    value: any
  ) => {
    setOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: g.options.map((o) =>
            o.key === optKey ? { ...o, [field]: value } : o
          ),
        };
      })
    );
  };

  const handleSave = () => {
    const processedGroups = optionGroups.map((g) => {
      const finalId = slugify(g.label || g.id); // generate ID from label only on save
      console.log("OptionGroup Label:", g.label, "-> Final ID:", finalId);

      return {
        ...g,
        id: finalId,
        options: g.options.map((o) => ({
          ...o,
          key: o.key, // keep option keys as-is
        })),
      };
    });

    console.log("Processed Groups ready to save:", processedGroups);

    Meteor.call(
      "menuItems.updateIngredients",
      item?.name?.toString(),
      baseIngredients,
      processedGroups,
      (err: any) => {
        if (err) {
          console.error(err);
          alert("Failed to save ingredients.");
        } else {
          onClose();
        }
      }
    );
  };


  return (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle sx={{ position: "relative", pr: 4 }}>
      <h2 className="text-2xl font-bold text-red-900 dark:text-white">
        Configure Customer Options for {item?.name}
      </h2>

      <button
        onClick={onClose}
        type="button"
        className="absolute top-3 right-3 p-1 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-stone-600 dark:hover:text-white"
      >
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
        <span className="sr-only">Close modal</span>
      </button>
    </DialogTitle>

    <DialogContent dividers>
      {/* === Base Ingredients === */}
      <h2 className="text-xl font-semibold text-red-900 dark:text-white">Base Ingredients</h2>

      {baseIngredients.map((b) => (
        <Box key={b.key} position="relative" sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, p: 1, borderRadius: 1, bgcolor: "background.paper", boxShadow: 0.5, pr: 6 }}>
          <TextField
            value={b.label}
            onChange={(e) => handleBaseChange(b.key, "label", e.target.value)}
            size="small"
            sx={{ flex: "1 1 40%" }}
          />
          <TextField
            label="Price"
            type="number"
            value={b.priceDelta ?? 0}
            onChange={(e) => handleBaseChange(b.key, "priceDelta", Number(e.target.value))}
            size="small"
            sx={{ flex: "0 0 120px" }}
          />

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" sx={{ color: "#111827", fontWeight: 500 }}>Optional:</Typography>
            <button
              type="button"
              onClick={() => handleBaseChange(b.key, "removable", !(b.removable ?? true))}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${b.removable ?? true ? "bg-press-up-purple" : "bg-gray-300"}`}
            >
              <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${b.removable ?? true ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" sx={{ color: "#111827", fontWeight: 500 }}>Default:</Typography>
            <button
              type="button"
              onClick={() => handleBaseChange(b.key, "default", !(b.default ?? false))}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${b.default ?? false ? "bg-press-up-purple" : "bg-gray-300"}`}
            >
              <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${b.default ?? false ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </Box>

          <div className="absolute top-1/2 -translate-y-1/2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10" onClick={() => handleRemoveBase(b.key)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </div>
        </Box>
      ))}

      <Button startIcon={<Add />} onClick={handleAddBase} sx={{ mt: 1, color: "#b91c1c" }}>Add Base Ingredient</Button>

      <Divider sx={{ my: 3 }} />

      {/* === Option Groups === */}
      <h2 className="text-xl font-semibold text-red-900 dark:text-white mb-2">Option Groups</h2>

      {optionGroups.map((g) => (
        <Box key={g.id} position="relative" sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper", pr: 6 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <TextField label="Group Label" value={g.label} onChange={(e) => handleGroupChange(g.id, "label", e.target.value)} size="small" sx={{ flex: "1 1 40%" }} />

            <TextField
              select
              SelectProps={{ native: true }}
              label="Type"
              value={g.type}
              onChange={(e) => handleGroupChange(g.id, "type", e.target.value as "single" | "multiple")}
              size="small"
              sx={{ flex: "0 0 150px" }}
            >
              <option value="single">Single</option>
              <option value="multiple">Multiple</option>
            </TextField>

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" sx={{ color: "#111827", fontWeight: 500 }}>Required:</Typography>
              <button
                type="button"
                onClick={() => handleGroupChange(g.id, "required", !(g.required ?? false))}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${g.required ? "bg-press-up-purple" : "bg-gray-300"}`}
              >
                <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${g.required ? "translate-x-5" : "translate-x-1"}`} />
              </button>
            </Box>

            <div className="absolute top-5.5 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10" onClick={() => handleRemoveGroup(g.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </div>
          </Box>

          {/* Options */}
          {g.options.map((o) => (
            <Box key={o.key} position="relative" sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, ml: 2, pr: 6 }}>
              <TextField value={o.label} onChange={(e) => handleOptionChange(g.id, o.key, "label", e.target.value)} size="small" sx={{ flex: "1 1 40%" }} />
              <TextField label="Price" type="number" value={o.priceDelta ?? 0} onChange={(e) => handleOptionChange(g.id, o.key, "priceDelta", Number(e.target.value))} size="small" sx={{ flex: "0 0 120px" }} />
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ color: "#111827" }}>Default:</Typography>
                <button type="button" onClick={() => handleOptionChange(g.id, o.key, "default", !(o.default ?? false))} className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${o.default ? "bg-press-up-purple" : "bg-gray-300"}`}>
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${o.default ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </Box>
              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10" onClick={() => handleRemoveOption(g.id, o.key)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </div>
            </Box>
          ))}

          <Button startIcon={<Add />} onClick={() => handleAddOption(g.id)} size="small" sx={{ ml: 2, mt: 1, color: "#b91c1c" }}>Add Option</Button>
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={() => handleAddGroup(undefined)} // initially no base selected
        sx={{ mt: 1, color: "#b91c1c" }}
      >
        Add Option Group
      </Button>
    </DialogContent>

    <DialogActions className="flex justify-end gap-3 p-4">
      <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg">Cancel</button>
      <button type="button" onClick={handleSave} className="bg-press-up-purple hover:bg-press-up-purple text-white px-4 py-2 rounded-lg">Save</button>
    </DialogActions>
  </Dialog>
  );
}

export default MenuItemIngredientsEditorDialog;
