import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "discord.js";

export function buttonRows(buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 5)));
  }
  return rows;
}

export function buttonGrid(rows: ButtonBuilder[][]): ActionRowBuilder<ButtonBuilder>[] {
  if (rows.length > 5) {
    throw new Error(`buttonGrid: ${rows.length} rows exceeds Discord's 5-row limit`);
  }
  return rows.map((row, i) => {
    if (row.length > 5) {
      throw new Error(`buttonGrid: row ${i} has ${row.length} buttons, exceeds Discord's 5-per-row limit`);
    }
    return new ActionRowBuilder<ButtonBuilder>().addComponents(row);
  });
}

export function selectMenuRow(menu: StringSelectMenuBuilder): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}
