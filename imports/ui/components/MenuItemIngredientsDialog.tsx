import React, { useEffect, useMemo, useState } from "react";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  List as MuiList,
  ListItem as MuiListItem,
  Typography as MuiTypography,
  Button as MuiButton,
  Divider as MuiDivider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Chip,
  Box,
} from "@mui/material";

import { MenuItemsCollection } from "/imports/api/menuItems/MenuItemsCollection";
import { MenuItem } from "/imports/api";
import { OrderMenuItem } from "/imports/api/orders/OrdersCollection";
import { Loading } from "../components/Loading";

const PURPLE = "#8E44AD";
const PURPLE_DARK = "#732d91";

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
  item: (MenuItem | OrderMenuItem) | null;
  orderId?: string;
  itemIndex?: number;
  locked?: boolean;
  onClose: () => void;
};

const Money: React.FC<{ delta?: number }> = ({ delta }) => {
  if (typeof delta !== "number" || delta === 0) return null;
  const sign = delta > 0 ? "+" : "";
  return (
    <Chip
      variant="outlined"
      size="small"
      label={`${sign}$${Math.abs(delta).toFixed(2)}`}
      sx={{
        ml: 1,
        borderColor: PURPLE,
        color: PURPLE,
        fontWeight: 600,
      }}
    />
  );
};

const MenuItemIngredientsDialog: React.FC<Props> = ({
  open,
  item,
  orderId,
  itemIndex,
  locked = false,
  onClose,
}) => {
  const isLoading = useSubscribe("menuItems")();

  const canonical = useTracker<CanonicalMenuItem | null>(() => {
    if (isLoading || !item?.name) return null;
    return (
      (MenuItemsCollection.findOne({ name: item.name }) as CanonicalMenuItem) ??
      null
    );
  }, [isLoading, item?.name]);

  const baseIngredients = useMemo(
    () => (canonical?.baseIngredients ?? []) as BaseIngredient[],
    [canonical?._id],
  );
  const optionGroups = useMemo(
    () => (canonical?.optionGroups ?? []) as OptionGroup[],
    [canonical?._id],
  );

  const hasNew = baseIngredients.length > 0 || optionGroups.length > 0;

  const [includedBase, setIncludedBase] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | Set<string>>
  >({});

  const savedBaseKeys = (item as OrderMenuItem)?.baseIncludedKeys ?? [];
  const savedSelections = (item as OrderMenuItem)?.optionSelections ?? {};

  useEffect(() => {
    if (!open || !canonical?._id) return;

    // Base on/off (respect saved keys if present; non-removable always on)
    const baseInit: Record<string, boolean> = {};
    const hasSavedBase = savedBaseKeys.length > 0;
    baseIngredients.forEach((b) => {
      baseInit[b.key] =
        b.removable === false
          ? true
          : hasSavedBase
            ? savedBaseKeys.includes(b.key)
            : !!b.default;
    });

    // Options (respect saved selections; otherwise defaults/required)
    const optInit: Record<string, string | Set<string>> = {};
    optionGroups.forEach((g) => {
      const defaults = g.options.filter((o) => o.default).map((o) => o.key);
      const saved = savedSelections[g.id];

      if (g.type === "single") {
        const savedOne = Array.isArray(saved) ? saved[0] : undefined;
        optInit[g.id] =
          savedOne ??
          defaults[0] ??
          (g.required && g.options[0] ? g.options[0].key : "");
      } else {
        const savedMany = Array.isArray(saved) ? saved : undefined;
        optInit[g.id] = new Set(savedMany ?? defaults);
      }
    });

    setIncludedBase(baseInit);
    setSelectedOptions(optInit);
  }, [open, canonical?._id]);

  const groupsByBaseKey = useMemo(() => {
    const map: Record<string, OptionGroup[]> = {};
    const baseKeys = new Set(baseIngredients.map((b) => b.key));
    optionGroups.forEach((g) => {
      const baseKey = g.id.split("-")[0];
      if (baseKeys.has(baseKey)) {
        (map[baseKey] ||= []).push(g);
      } else {
        (map["_ungrouped"] ||= []).push(g);
      }
    });
    return map;
  }, [baseIngredients, optionGroups]);

  const getDefaultForGroup = (g: OptionGroup): string | Set<string> => {
    if (g.type === "single") {
      const defKey =
        g.options.find((o) => o.default)?.key ||
        (g.required ? g.options[0]?.key || "" : "");
      return defKey || "";
    }
    return new Set(g.options.filter((o) => o.default).map((o) => o.key));
  };

  const toggleBase = (b: BaseIngredient) => {
    if (b.removable === false) return;
    setIncludedBase((prev) => {
      const next = { ...prev, [b.key]: !prev[b.key] };
      const deps = groupsByBaseKey[b.key] || [];
      setSelectedOptions((prevSel) => {
        const clone = { ...prevSel };
        if (next[b.key] === false) {
          for (const g of deps) {
            clone[g.id] = g.type === "single" ? "" : new Set<string>();
          }
        } else {
          for (const g of deps) {
            if (g.type === "single") {
              const current = clone[g.id] as string;
              if (!current) clone[g.id] = getDefaultForGroup(g) as string;
            } else {
              const current = clone[g.id] as Set<string>;
              if (!current || current.size === 0)
                clone[g.id] = getDefaultForGroup(g) as Set<string>;
            }
          }
        }
        return clone;
      });
      return next;
    });
  };

  const handleSingleChange = (groupId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: value }));
  };

  const handleMultiToggle = (groupId: string, key: string) => {
    setSelectedOptions((prev) => {
      const cur = prev[groupId] as Set<string>;
      const next = new Set(cur ?? []);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, [groupId]: next };
    });
  };

  const buildSelections = (): Record<string, string[]> => {
    const sel: Record<string, string[]> = {};
    for (const g of optionGroups) {
      const v = selectedOptions[g.id];
      const baseKey = g.id.split("-")[0];
      const baseExists = baseIngredients.some((b) => b.key === baseKey);
      const baseOn = !baseExists || !!includedBase[baseKey];

      if (!baseOn) {
        sel[g.id] = [];
        continue;
      }

      sel[g.id] =
        g.type === "single"
          ? typeof v === "string" && v
            ? [v]
            : []
          : Array.from((v as Set<string>) ?? []);
    }
    return sel;
  };

  const totalDelta = useMemo(() => {
    let sum = 0;

    baseIngredients.forEach((b) => {
      if (includedBase[b.key] && typeof b.priceDelta === "number") {
        sum += b.priceDelta;
      }
    });

    optionGroups.forEach((g) => {
      const baseKey = g.id.split("-")[0];
      const baseExists = baseIngredients.some((b) => b.key === baseKey);
      const baseOn = !baseExists || !!includedBase[baseKey];
      if (!baseOn) return;

      if (g.type === "single") {
        const sel = selectedOptions[g.id] as string;
        const opt = g.options.find((o) => o.key === sel);
        if (opt?.priceDelta) sum += opt.priceDelta;
      } else {
        const set = selectedOptions[g.id] as Set<string>;
        (set ? Array.from(set) : []).forEach((k) => {
          const opt = g.options.find((o) => o.key === k);
          if (opt?.priceDelta) sum += opt.priceDelta;
        });
      }
    });

    return sum;
  }, [baseIngredients, optionGroups, includedBase, selectedOptions]);

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          border: `3px solid ${PURPLE}`,
          borderRadius: 2,
        },
      }}
    >
      <MuiDialogTitle
        sx={{
          color: PURPLE,
          fontWeight: 700,
          borderBottom: `1px solid ${PURPLE}22`,
        }}
      >
        {item?.name ?? "Ingredients"}
      </MuiDialogTitle>
      <MuiDialogContent
        dividers
        sx={{
          "& .MuiTypography--section": { color: PURPLE, fontWeight: 700 },
        }}
      >
        {isLoading ? (
          <MuiTypography variant="body2" color="text.secondary">
            <Loading />
          </MuiTypography>
        ) : hasNew ? (
          <>
            {baseIngredients.map((b) => (
              <Box key={b.key}>
                <MuiListItem disableGutters>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!includedBase[b.key]}
                        onChange={() => toggleBase(b)}
                        disabled={b.removable === false}
                        size="small"
                        sx={{
                          "&.Mui-checked": { color: PURPLE },
                          "&:hover": {
                            backgroundColor: "rgba(142,68,173,0.08)",
                          },
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <MuiTypography variant="body2">{b.label}</MuiTypography>
                        <Money delta={b.priceDelta} />
                      </Box>
                    }
                  />
                </MuiListItem>
                {(groupsByBaseKey[b.key] || []).map((g) => (
                  <Box key={g.id} sx={{ pl: 4 }}>
                    <MuiTypography
                      variant="body2"
                      sx={{ fontWeight: 700, color: PURPLE }}
                    >
                      {g.label}
                    </MuiTypography>
                    {g.type === "single" ? (
                      <RadioGroup
                        value={(selectedOptions[g.id] as string) ?? ""}
                        onChange={(e) =>
                          handleSingleChange(g.id, e.target.value)
                        }
                      >
                        {g.options.map((o) => (
                          <FormControlLabel
                            key={o.key}
                            value={o.key}
                            control={
                              <Radio
                                size="small"
                                disabled={!includedBase[b.key]}
                                sx={{
                                  "&.Mui-checked": { color: PURPLE },
                                  "&:hover": {
                                    backgroundColor: "rgba(142,68,173,0.08)",
                                  },
                                }}
                              />
                            }
                            label={
                              <Box display="flex" alignItems="center">
                                <MuiTypography variant="body2">
                                  {o.label}
                                </MuiTypography>
                                <Money delta={o.priceDelta} />
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                    ) : (
                      <MuiList dense>
                        {g.options.map((o) => (
                          <MuiListItem key={o.key} disableGutters>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={(
                                    (selectedOptions[g.id] as Set<string>) ??
                                    new Set()
                                  ).has(o.key)}
                                  onChange={() =>
                                    handleMultiToggle(g.id, o.key)
                                  }
                                  size="small"
                                  disabled={!includedBase[b.key]}
                                  sx={{
                                    "&.Mui-checked": { color: PURPLE },
                                    "&:hover": {
                                      backgroundColor: "rgba(142,68,173,0.08)",
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box display="flex" alignItems="center">
                                  <MuiTypography variant="body2">
                                    {o.label}
                                  </MuiTypography>
                                  <Money delta={o.priceDelta} />
                                </Box>
                              }
                            />
                          </MuiListItem>
                        ))}
                      </MuiList>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
            {(groupsByBaseKey["_ungrouped"] || []).map((g) => (
              <Box key={g.id} sx={{ mt: 1 }}>
                <MuiTypography
                  variant="body2"
                  sx={{ fontWeight: 700, color: PURPLE }}
                >
                  {g.label}
                </MuiTypography>
                {g.type === "single" ? (
                  <RadioGroup
                    value={(selectedOptions[g.id] as string) ?? ""}
                    onChange={(e) => handleSingleChange(g.id, e.target.value)}
                  >
                    {g.options.map((o) => (
                      <FormControlLabel
                        key={o.key}
                        value={o.key}
                        control={<Radio size="small" />}
                        label={
                          <Box display="flex" alignItems="center">
                            <MuiTypography variant="body2">
                              {o.label}
                            </MuiTypography>
                            <Money delta={o.priceDelta} />
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <MuiList dense>
                    {g.options.map((o) => (
                      <MuiListItem key={o.key} disableGutters>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={(
                                (selectedOptions[g.id] as Set<string>) ??
                                new Set()
                              ).has(o.key)}
                              onChange={() => handleMultiToggle(g.id, o.key)}
                              size="small"
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <MuiTypography variant="body2">
                                {o.label}
                              </MuiTypography>
                              <Money delta={o.priceDelta} />
                            </Box>
                          }
                        />
                      </MuiListItem>
                    ))}
                  </MuiList>
                )}
              </Box>
            ))}
            <MuiDivider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <MuiTypography variant="body2">Options subtotal</MuiTypography>
              <MuiTypography variant="body2" fontWeight="bold">
                {totalDelta >= 0 ? "+" : "-"}${Math.abs(totalDelta).toFixed(2)}
              </MuiTypography>
            </Box>
          </>
        ) : (
          <MuiTypography variant="body2" color="text.secondary">
            No ingredients listed.
          </MuiTypography>
        )}
      </MuiDialogContent>
      <MuiDivider sx={{ my: 0, borderColor: `${PURPLE}33` }} />
      <MuiDialogActions sx={{ p: 2 }}>
        <MuiButton
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: PURPLE,
            color: PURPLE,
            "&:hover": {
              borderColor: PURPLE_DARK,
              backgroundColor: "rgba(142,68,173,0.08)",
            },
          }}
        >
          Close
        </MuiButton>
        <MuiButton
          onClick={() => {
            const selections = buildSelections();
            const baseIncludedKeys = baseIngredients
              .filter((b) => includedBase[b.key])
              .map((b) => b.key);
            Meteor.call(
              "orders.updateMenuItemSelections",
              orderId,
              itemIndex,
              selections,
              baseIncludedKeys,
              (err: any) => {
                if (err) {
                  console.error(err);
                  alert("Failed to save options.");
                } else {
                  onClose();
                }
              },
            );
          }}
          variant="contained"
          disabled={locked}
          sx={{
            backgroundColor: PURPLE,
            "&:hover": { backgroundColor: PURPLE_DARK },
          }}
        >
          Save
        </MuiButton>
      </MuiDialogActions>
    </MuiDialog>
  );
};

export default MenuItemIngredientsDialog;
