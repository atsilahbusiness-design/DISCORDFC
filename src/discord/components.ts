import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';

export function careerControls(userId: string): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:profile`).setLabel('Profile').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`frs:${userId}:train`).setLabel('Train').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:match`).setLabel('Play match').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`frs:${userId}:club`).setLabel('Club office').setStyle(ButtonStyle.Secondary)
    )
  ];
}

export function trainingControls(userId: string): ActionRowBuilder<StringSelectMenuBuilder>[] {
  const options = [
    ['atk', 'Attack'],
    ['def', 'Defence'],
    ['speed', 'Speed'],
    ['power', 'Power'],
    ['strength', 'Strength'],
    ['technique', 'Technique']
  ].map(([value, label]) => new StringSelectMenuOptionBuilder().setValue(value).setLabel(label));
  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`frs:${userId}:train-select`)
        .setPlaceholder('Pilih ability untuk dilatih')
        .addOptions(options)
    )
  ];
}
