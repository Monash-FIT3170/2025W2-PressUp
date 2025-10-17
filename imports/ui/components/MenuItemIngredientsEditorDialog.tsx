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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Meteor } from "meteor/meteor";
import { MenuItemsCollection } from "/imports/api/menuItems/MenuItemsCollection";
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
          <Box
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
            }}
          >
            <TextField
              label="Label"
              value={b.label}
              onChange={(e) => handleBaseChange(b.key, "label", e.target.value)}
              size="small"
              sx={{ flex: "1 1 40%" }}
            />
            <TextField
              label="Price Δ"
              type="number"
              value={b.priceDelta ?? 0}
              onChange={(e) => handleBaseChange(b.key, "priceDelta", Number(e.target.value))}
              size="small"
              sx={{ flex: "0 0 120px" }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Optional:</Typography>
              <Switch
                checked={b.removable ?? true}
                onChange={(e) => handleBaseChange(b.key, "removable", e.target.checked)}
                size="small"
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Default:</Typography>
              <Switch
                checked={b.default ?? false}
                onChange={(e) => handleBaseChange(b.key, "default", e.target.checked)}
                size="small"
              />
            </Box>
            <IconButton color="error" onClick={() => handleRemoveBase(b.key)}>
              <Delete />
            </IconButton>
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
          <Box
            key={g.id}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
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
                <Typography variant="body2">Required:</Typography>
                <Switch
                  checked={g.required ?? false}
                  onChange={(e) => handleGroupChange(g.id, "required", e.target.checked)}
                  size="small"
                />
              </Box>

              <IconButton color="error" onClick={() => handleRemoveGroup(g.id)}>
                <Delete />
              </IconButton>
            </Box>

            {g.options.map((o) => (
              <Box
                key={o.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1,
                  ml: 2,
                }}
              >
                <TextField
                  label="Label"
                  value={o.label}
                  onChange={(e) => handleOptionChange(g.id, o.key, "label", e.target.value)}
                  size="small"
                  sx={{ flex: "1 1 40%" }}
                />
                <TextField
                  label="Price Δ"
                  type="number"
                  value={o.priceDelta ?? 0}
                  onChange={(e) =>
                    handleOptionChange(g.id, o.key, "priceDelta", Number(e.target.value))
                  }
                  size="small"
                  sx={{ flex: "0 0 120px" }}
                />
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Default:</Typography>
                  <Switch
                    checked={o.default ?? false}
                    onChange={(e) =>
                      handleOptionChange(g.id, o.key, "default", e.target.checked)
                    }
                    size="small"
                  />
                </Box>
                <IconButton color="error" onClick={() => handleRemoveOption(g.id, o.key)}>
                  <Delete />
                </IconButton>
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

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );}


export default MenuItemIngredientsEditorDialog;
