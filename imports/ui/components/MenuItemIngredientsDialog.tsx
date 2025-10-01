import React from "react";
import { MenuItem } from "/imports/api";
import { OrderMenuItem } from "/imports/api/orders/OrdersCollection";
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
} from "@mui/material";

type Props = {
  open: boolean;
  item: (MenuItem | OrderMenuItem) | null;
  onClose: () => void;
};

const MenuItemIngredientsDialog: React.FC<Props> = ({ open, item, onClose }) => {
  const ingredients = Array.isArray(item?.ingredients) ? item!.ingredients : [];

  return (
    <MuiDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <MuiDialogTitle>{item?.name ?? "Ingredients"}</MuiDialogTitle>
      <MuiDialogContent dividers>
        {ingredients.length > 0 ? (
          <MuiList dense>
            {ingredients.map((ing, idx) => (
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
