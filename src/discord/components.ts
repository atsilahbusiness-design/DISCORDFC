import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { DETAILED_SKILLS, DETAILED_SKILL_LABELS, FORMATIONS, TACTICS, type FormationId, type TacticId, type VersusPlayer } from '../domain/types.js';

function modeControls(userId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`frs:${userId}:coach-profile`).setLabel('Coach Mode').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Versus Mode').setStyle(ButtonStyle.Success)
  );
}

export function careerControls(userId: string): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:profile`).setLabel('Profile').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`frs:${userId}:train`).setLabel('Train').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:match`).setLabel('Play match').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`frs:${userId}:club`).setLabel('Club office').setStyle(ButtonStyle.Secondary)
    ),
    modeControls(userId)
  ];
}

export function gameplayControls(userId: string): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:profile`).setLabel('Profile').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`frs:${userId}:skills`).setLabel('Detailed skills').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:next-week`).setLabel('Next week').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`frs:${userId}:match`).setLabel('Play match').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`frs:${userId}:club`).setLabel('Club office').setStyle(ButtonStyle.Secondary)
    ),
    modeControls(userId)
  ];
}

export function detailedTrainingControls(userId: string): ActionRowBuilder<StringSelectMenuBuilder>[] {
  const options = DETAILED_SKILLS.map((skill) => new StringSelectMenuOptionBuilder().setValue(skill).setLabel(DETAILED_SKILL_LABELS[skill]));
  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder().setCustomId(`frs:${userId}:detailed-train-select`).setPlaceholder('Pilih detailed skill untuk dilatih').addOptions(options)
    )
  ];
}

export function versusHomeControls(userId: string, nextLabel = 'Next Battle'): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Home').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-next`).setLabel(nextLabel).setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-lineup-start`).setLabel('Lineup').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-results`).setLabel('Results').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-standings`).setLabel('Standings').setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-registration`).setLabel('Registration').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-market`).setLabel('Market').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-rewards`).setLabel('Rewards').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-schedule`).setLabel('Schedule').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-rankings`).setLabel('Rankings').setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-global-ranking`).setLabel('Global Ranking').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-sponsor`).setLabel('Sponsor').setStyle(ButtonStyle.Secondary)
    )
  ];
}

function versusToken(value: string | number): string {
  return encodeURIComponent(String(value));
}

function versusContext(userId: string, action: string, battleId: string, rosterVersion: number): string {
  return `frs:${userId}:${action}:${versusToken(battleId)}:${rosterVersion}`;
}

function playerOption(player: VersusPlayer, selected = false): StringSelectMenuOptionBuilder {
  const eligible = player.hp > 0 && player.status === 'AVAILABLE' && player.redCardBan === 0;
  return new StringSelectMenuOptionBuilder()
    .setValue(player.id)
    .setLabel(`${player.name} · ${player.id.split(':').pop() ?? player.id}`.slice(0, 100))
    .setDescription(`HP ${player.hp}/${player.maxHp} · ${player.position} · ${eligible ? 'Eligible' : 'Blocked'}`.slice(0, 100))
    .setDefault(selected);
}

export function versusMarketControls(userId: string, tab: 'DEAL' | 'SCOUT' = 'DEAL'): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-market-deal`).setLabel('Deal').setStyle(tab === 'DEAL' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-market-scout`).setLabel('Scout').setStyle(tab === 'SCOUT' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Home').setStyle(ButtonStyle.Secondary)
    )
  ];
}

export function versusRankingControls(userId: string): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-ranking-club`).setLabel('Club').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-ranking-mvp`).setLabel('MVP').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-ranking-scorers`).setLabel('Top Scorers').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-ranking-assists`).setLabel('Top Assists').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-ranking-goalkeepers`).setLabel('Goalkeepers').setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Home').setStyle(ButtonStyle.Secondary))
  ];
}

export function versusSponsorControls(userId: string): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-sponsor-junior`).setLabel('Junior Sponsor').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-sponsor-senior`).setLabel('Senior Sponsor').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-sponsor-top`).setLabel('Top Sponsor').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Home').setStyle(ButtonStyle.Secondary)
    )
  ];
}

export function versusSetupControls(userId: string, battleId: string, rosterVersion: number, formation: FormationId, tactic: TacticId): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {
  const formationSelect = new StringSelectMenuBuilder().setCustomId(versusContext(userId, 'versus-pick-formation', battleId, rosterVersion)).setPlaceholder(`Formation: ${formation}`).setMinValues(1).setMaxValues(1).addOptions(Object.values(FORMATIONS).map((item) => new StringSelectMenuOptionBuilder().setValue(item.id).setLabel(`${item.id} · ${item.name}`).setDescription(`${item.slots.GK} GK · ${item.slots.DF} DF · ${item.slots.MF} MF · ${item.slots.FW} FW`).setDefault(item.id === formation)));
  const tacticSelect = new StringSelectMenuBuilder().setCustomId(versusContext(userId, 'versus-pick-tactic', battleId, rosterVersion)).setPlaceholder(`Tactic: ${TACTICS[tactic].name}`).setMinValues(1).setMaxValues(1).addOptions(Object.entries(TACTICS).map(([id, item]) => new StringSelectMenuOptionBuilder().setValue(id).setLabel(item.name).setDescription(item.description).setDefault(id === tactic)));
  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(formationSelect),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(tacticSelect),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(versusContext(userId, 'versus-lineup-squad', battleId, rosterVersion)).setLabel('Choose XI').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
    )
  ];
}

export function versusPositionControls(userId: string, battleId: string, rosterVersion: number, formation: FormationId, roster: VersusPlayer[], selected: Record<string, string[]>): ActionRowBuilder<any>[] {
  const slots = FORMATIONS[formation].slots;
  const positions = ['GK', 'DF', 'MF', 'FW'] as const;
  const rows: ActionRowBuilder<any>[] = positions.map((position) => {
    const options = roster.filter((player) => player.position === position).map((player) => playerOption(player, selected[position]?.includes(player.id)));
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder().setCustomId(versusContext(userId, `versus-pick-${position.toLowerCase()}`, battleId, rosterVersion)).setPlaceholder(`${position} · pilih ${slots[position]} pemain`).setMinValues(slots[position]).setMaxValues(slots[position]).addOptions(options));
  });
  rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(versusContext(userId, 'versus-lineup-final', battleId, rosterVersion)).setLabel('Review Lineup').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(versusContext(userId, 'versus-lineup-start', battleId, rosterVersion)).setLabel('Back').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
  ));
  return rows;
}

export function versusFinalizeControls(userId: string, battleId: string, rosterVersion: number, lineup: string[], roster: VersusPlayer[], captain?: string, substitutes: string[] = []): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {
  const selectedPlayers = roster.filter((player) => lineup.includes(player.id));
  const benchPlayers = roster.filter((player) => !lineup.includes(player.id));
  const captainSelect = new StringSelectMenuBuilder().setCustomId(versusContext(userId, 'versus-pick-captain', battleId, rosterVersion)).setPlaceholder(`Captain: ${captain ?? 'choose'}`).setMinValues(1).setMaxValues(1).addOptions(selectedPlayers.map((player) => playerOption(player, captain === player.id)));
  const substituteSelect = new StringSelectMenuBuilder().setCustomId(versusContext(userId, 'versus-pick-substitutes', battleId, rosterVersion)).setPlaceholder('Substitutes · optional, max 5').setMinValues(0).setMaxValues(Math.min(5, benchPlayers.length)).addOptions(benchPlayers.map((player) => playerOption(player, substitutes.includes(player.id))));
  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(captainSelect),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(substituteSelect),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(versusContext(userId, 'versus-lineup-confirm', battleId, rosterVersion)).setLabel('Confirm Submission').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(versusContext(userId, 'versus-lineup-squad', battleId, rosterVersion)).setLabel('Edit XI').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`frs:${userId}:versus-home`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
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
