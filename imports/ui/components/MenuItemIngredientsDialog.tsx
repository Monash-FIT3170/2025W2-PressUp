import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemText as MuiListItemText,
  Typography as MuiTypography,
  Button as MuiButton,
  Divider as MuiDivider,
} from "@mui/material";

import {
  MenuItemsCollection,
} from "/imports/api/menuItems/MenuItemsCollection";
import { MenuItem } from "/imports/api";
import { OrderMenuItem } from "/imports/api/orders/OrdersCollection";

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
  onClose: () => void;
};

const MenuItemIngredientsDialog: React.FC<Props> = ({ open, item, onClose }) => {
  // 메뉴 원본 도큐먼트 가져오기 (주문 스냅샷이 아닌, MenuItemsCollection에서)
  const canonical = useTracker<CanonicalMenuItem | null>(() => {
    if (!item) return null;
    const anyItem = item as any;
    const key = anyItem.menuItemId || anyItem._id; // 주문 라인에 menuItemId가 있다면 우선
    if (key) {
      return (MenuItemsCollection.findOne(key) as CanonicalMenuItem) ?? null;
    }
    if (item.name) {
      return (MenuItemsCollection.findOne({ name: item.name }) as CanonicalMenuItem) ?? null;
    }
    return null;
  }, [item?._id, (item as any)?.menuItemId, item?.name]);

  // 새 구조 우선, 없으면 레거시 ingredients 사용
  const baseIngredients: BaseIngredient[] =
    (canonical?.baseIngredients as BaseIngredient[]) ??
    ((item as any)?.baseIngredients as BaseIngredient[]) ??
    [];

  const optionGroups: OptionGroup[] =
    (canonical?.optionGroups as OptionGroup[]) ??
    ((item as any)?.optionGroups as OptionGroup[]) ??
    [];

  const legacyIngredients: string[] =
    (canonical?.ingredients as string[]) ??
    (Array.isArray(item?.ingredients) ? (item!.ingredients as string[]) : []) ??
    [];

  const hasNew = (baseIngredients?.length ?? 0) > 0 || (optionGroups?.length ?? 0) > 0;

  return (
    <MuiDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <MuiDialogTitle>{item?.name ?? "Ingredients"}</MuiDialogTitle>
      <MuiDialogContent dividers>
        {hasNew ? (
          <>
            {/* Base / 기본 재료 */}
            {baseIngredients.length > 0 && (
              <>
                <MuiTypography variant="subtitle2" sx={{ mb: 1 }}>
                  Base Ingredients
                </MuiTypography>
                <MuiList dense>
                  {baseIngredients.map((b, idx) => (
                    <MuiListItem key={`${b.key}-${idx}`} disableGutters>
                      <MuiListItemText
                        primary={
                          <>
                            {b.label}
                            {b.removable === false && " (fixed)"}
                            {b.removable === true && " (removable)"}
                            {typeof b.priceDelta === "number" && b.priceDelta !== 0
                              ? ` (${b.priceDelta > 0 ? "+" : ""}$${b.priceDelta.toFixed(2)})`
                              : ""}
                          </>
                        }
                        secondary={b.default ? "default" : undefined}
                      />
                    </MuiListItem>
                  ))}
                </MuiList>
              </>
            )}

            {/* 옵션 그룹 */}
            {optionGroups.length > 0 && (
              <>
                {baseIngredients.length > 0 && <MuiDivider sx={{ my: 1.5 }} />}
                <MuiTypography variant="subtitle2" sx={{ mb: 1 }}>
                  Options
                </MuiTypography>
                {optionGroups.map((g) => {
                  const defaults = g.options.filter((o) => o.default);
                  return (
                    <div key={g.id} style={{ marginBottom: 8 }}>
                      <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
                        {g.label} {g.required ? "(required)" : ""} {g.type === "multiple" ? "[multi]" : "[single]"}
                      </MuiTypography>
                      <MuiList dense>
                        {(defaults.length > 0 ? defaults : g.options).map((o) => (
                          <MuiListItem key={`${g.id}-${o.key}`} disableGutters>
                            <MuiListItemText
                              primary={
                                <>
                                  {o.label}
                                  {typeof o.priceDelta === "number" && o.priceDelta !== 0
                                    ? ` (${o.priceDelta > 0 ? "+" : ""}$${o.priceDelta.toFixed(2)})`
                                    : ""}
                                </>
                              }
                              secondary={o.default ? "default" : undefined}
                            />
                          </MuiListItem>
                        ))}
                      </MuiList>
                    </div>
                  );
                })}
              </>
            )}
          </>
        ) : legacyIngredients.length > 0 ? (
          <MuiList dense>
            {legacyIngredients.map((ing, idx) => (
              <MuiListItem key={`${ing}-${idx}`} disableGutters>
                <MuiListItemText primary={ing} />
              </MuiListItem>
            ))}
          </MuiList>
        ) : (
          <MuiTypography variant="body2" color="text.secondary">
            No ingredients listed.
          </MuiTypography>
        )}
      </MuiDialogContent>
      <MuiDialogActions>
        <MuiButton onClick={onClose} variant="outlined">
          Close
        </MuiButton>
      </MuiDialogActions>
    </MuiDialog>
  );
};

export default MenuItemIngredientsDialog;
