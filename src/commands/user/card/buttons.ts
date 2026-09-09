import { ButtonInteraction } from "discord.js";
import { showInfoModal } from "./modals";
import {
  showSelectField,
  submitSelectField,
  cancelSelectField,
} from "./selects";
import { GridCategory, SelectField } from "../../../types/command";
import { cancelGrid, showGrid, submitGrid, toggleGridItem } from "./grids";

const selectFields: SelectField[] = ["GENERATION", "RANK"];
const isSelectField = (v: string): v is SelectField =>
  (selectFields as string[]).includes(v);

const gridCategories: GridCategory[] = ["PLATFORMS", "GAMES", "WEAPONS"];
const isGridCategory = (v: string): v is GridCategory =>
  (gridCategories as string[]).includes(v);

export async function handleCardButtons(
  interaction: ButtonInteraction,
  args: string[],
) {
  const [action, ...rest] = args;

  switch (action) {
    case "open": {
      const [field] = rest;
      if (field === "info") return showInfoModal(interaction);
      if (isSelectField(field)) return showSelectField(interaction, field);
      if (isGridCategory(field)) return showGrid(interaction, field);
      return console.error(`[Err]: Unknown card open field '${field}'.`);
    }
    case "toggle": {
      const [category, indexStr] = rest;
      if (!isGridCategory(category))
        return console.error(`[Err]: Unknown toggle category '${category}'.`);
      return toggleGridItem(interaction, category, Number(indexStr));
    }
    case "submit": {
      const [target] = rest;
      if (isGridCategory(target)) return submitGrid(interaction, target);
      if (isSelectField(target)) return submitSelectField(interaction, target);
      break;
    }
    case "cancel": {
      const [target] = rest;
      if (isGridCategory(target)) return cancelGrid(interaction, target);
      if (isSelectField(target)) return cancelSelectField(interaction, target);
      break;
    }
    default:
      console.error(`[Err]: Unknown card button action '${action}'.`);
  }
}
