import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Button,
  Divider,
  Switch,
  Box,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
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

  const handleAddGroup = (baseKey?: string) => {
    const newId = baseKey ? `${baseKey}-group-${Date.now()}` : `group-${Date.now()}`;
    setOptionGroups((prev) => [
      ...prev,
      { id: newId, label: "", type: "single", required: false, options: [] },
    ]);
  };

  const handleRemoveGroup = (id: string) => {
    setOptionGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const handleGroupChange = (id: string, field: keyof OptionGroup, value: any) => {
    setOptionGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    );
  };

  const handleAddOption = (groupId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: [
                ...g.options,
                { key: `opt-${Date.now()}`, label: "", default: false, priceDelta: 0 },
              ],
            }
          : g,
      ),
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
    value: any,
  ) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.key === optKey ? { ...o, [field]: value } : o,
              ),
            }
          : g,
      ),
    );
  };

  const handleSave = () => {
    Meteor.call(
      "menuItems.updateIngredients",
      item?.name?.toString(),
      baseIngredients,
      optionGroups,
      (err: any) => {
        if (err) {
          console.error(err);
          alert("Failed to save ingredients.");
        } else {
          onClose();
        }
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Configure Ingredients for {item?.name}</DialogTitle>

      <DialogContent dividers>
        {/* === Base Ingredients === */}
        <Typography variant="h6" gutterBottom>
          Base Ingredients
        </Typography>

        {baseIngredients.map((b) => (
          <Box position="relative"
            key={b.key}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: "background.paper",
              boxShadow: 0.5,
              pr: 6,
            }}
          >
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
              <Typography
                variant="body2"
                sx={{ color: "#111827", fontWeight: 500 }} // optional, matches Tailwind style
              >
                Optional:
              </Typography>

              <button
                type="button"
                onClick={() =>
                  handleBaseChange(b.key, "removable", !(b.removable ?? true))
                }
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${
                  b.removable ?? true ? "bg-press-up-purple" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                    b.removable ?? true ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{ color: "#111827", fontWeight: 500 }}
              >
                Default:
              </Typography>

              <button
                type="button"
                onClick={() =>
                  handleBaseChange(b.key, "default", !(b.default ?? false))
                }
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${
                  b.default ?? false ? "bg-press-up-purple" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                    b.default ?? false ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </Box>
            <div
                  className="absolute top-1/2 -translate-y-1/2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                  onClick={() => handleRemoveBase(b.key)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </div>
          </Box>
        ))}

        <Button startIcon={<Add />} onClick={handleAddBase} sx={{ mt: 1 }}>
          Add Base Ingredient
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* === Option Groups === */}
        <Typography variant="h6" gutterBottom>
          Option Groups
        </Typography>

        {optionGroups.map((g) => (
          <Box position="relative"
            key={g.id}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
              pr: 6,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <TextField
                label="Group Label"
                value={g.label}
                onChange={(e) => handleGroupChange(g.id, "label", e.target.value)}
                size="small"
                sx={{ flex: "1 1 40%" }}
              />
              <TextField
                select
                SelectProps={{ native: true }}
                label="Type"
                value={g.type}
                onChange={(e) =>
                  handleGroupChange(g.id, "type", e.target.value as "single" | "multiple")
                }
                size="small"
                sx={{ flex: "0 0 150px" }}
              >
                <option value="single">Single</option>
                <option value="multiple">Multiple</option>
              </TextField>

              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  sx={{ color: "#111827", fontWeight: 500 }} // optional to match Tailwind text style
                >
                  Required:
                </Typography>

                <button
                  type="button"
                  onClick={() =>
                    handleGroupChange(g.id, "required", !(g.required ?? false))
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${
                    g.required ? "bg-press-up-purple" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                      g.required ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </Box>
              <div
                  className="absolute top-5.5 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                  onClick={() => handleRemoveGroup(g.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </div>
            </Box>

            {g.options.map((o) => (
              <Box position="relative"
                key={o.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1,
                  ml: 2,
                  pr: 6,
                }}
              >
                <TextField
                  value={o.label}
                  onChange={(e) => handleOptionChange(g.id, o.key, "label", e.target.value)}
                  size="small"
                  sx={{ flex: "1 1 40%" }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={o.priceDelta ?? 0}
                  onChange={(e) =>
                    handleOptionChange(g.id, o.key, "priceDelta", Number(e.target.value))
                  }
                  size="small"
                  sx={{ flex: "0 0 120px" }}
                />
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" sx={{ color: "#111827" }}>
                    Default:
                  </Typography>

                  <button
                    type="button"
                    onClick={() =>
                      handleOptionChange(g.id, o.key, "default", !(o.default ?? false))
                    }
                    className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors focus:outline-none focus:ring-2 focus:ring-press-up-purple ${
                      o.default ? "bg-press-up-purple" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        o.default ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </Box>
                <div
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                  onClick={() => handleRemoveOption(g.id, o.key)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </div>
              </Box>
            ))}

            <Button
              startIcon={<Add />}
              onClick={() => handleAddOption(g.id)}
              size="small"
              sx={{ ml: 2, mt: 1 }}
            >
              Add Option
            </Button>
          </Box>
        ))}

        <Button startIcon={<AddIcon />} onClick={() => handleAddGroup()}>
        Add Option Group
        </Button>
      </DialogContent>
      <DialogActions className="flex justify-end gap-3 p-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="bg-press-up-purple hover:bg-press-up-purple text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>
      </DialogActions>
    </Dialog>
  );}


export default MenuItemIngredientsEditorDialog;
