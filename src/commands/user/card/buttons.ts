import { ButtonInteraction } from "discord.js";
import { showInfoModal } from "./modals";
import { showGenerationSelect } from "./selects";
import { showGrid, toggleGridItem, submitGrid, cancelGrid } from "./grids";
import { buildMainEditorRow, buildUserProfileCard } from "./formats";
import { upsertProfile } from "../../../utils/database";
import { GridCategory } from "../../../types/command";

const GRID_CATEGORIES: GridCategory[] = ["PLATFORMS", "GAMES", "WEAPONS"];
const isGridCategory = (cat: string): cat is GridCategory =>
  (GRID_CATEGORIES as string[]).includes(cat);
export async function handleCardButtons(
  interaction: ButtonInteraction,
  args: string[],
) {
  const [action, ...rest] = args;

  switch (action) {
    case "open": {
      const [field] = rest;
      if (field === "info") return showInfoModal(interaction);
      if (field === "generation") return showGenerationSelect(interaction);
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
      const [category] = rest;
      if (isGridCategory(category)) return submitGrid(interaction, category);
      break;
    }
    case "cancel": {
      const [category] = rest;
      if (category === "generation") {
        return interaction.update({
          embeds: [
            await buildUserProfileCard(
              interaction.user,
              await upsertProfile(interaction.user.id),
            ),
          ],
          components: buildMainEditorRow(),
        });
      }
      if (isGridCategory(category)) return cancelGrid(interaction, category);
      break;
    }
    default:
      console.error(`[Err]: Unknown card button action '${action}'.`);
  }
}
