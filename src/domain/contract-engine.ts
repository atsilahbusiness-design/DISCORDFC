import { formatMoney } from './progression-engine.js';
import type { ContractState, PlayerProfile } from './types.js';

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function getContractStatus(profileInput: PlayerProfile, now = new Date()): ContractState | undefined {
  const profile = clone(profileInput);
  if (!profile.contract) return undefined;
  if (profile.contract.state === 'ACTIVE' && new Date(profile.contract.endTime).getTime() <= now.getTime()) profile.contract.state = 'EXPIRED';
  return profile.contract;
}

export function signContract(profileInput: PlayerProfile, now = new Date(), termDays = 180): PlayerProfile {
  const profile = clone(profileInput);
  const salary = 120 + profile.level * 30 + Math.floor(profile.stats.atk + profile.stats.technique) / 4;
  profile.contract = {
    id: `contract-${profile.userId}-${now.getTime()}`,
    clubId: profile.club,
    salary: Math.round(salary),
    beginTime: now.toISOString(),
    endTime: new Date(now.getTime() + termDays * 86_400_000).toISOString(),
    state: 'ACTIVE',
    type: profile.contract?.state === 'EXPIRED' ? 'RENEWAL' : 'INITIAL'
  };
  profile.updatedAt = now.toISOString();
  return profile;
}

export function renewContract(profileInput: PlayerProfile, now = new Date(), termDays = 180): PlayerProfile {
  const current = getContractStatus(profileInput, now);
  if (current?.state === 'ACTIVE' && new Date(current.endTime).getTime() > now.getTime()) throw new Error('Kontrak masih aktif.');
  return signContract(profileInput, now, termDays);
}

export function formatContract(contract: ContractState | undefined, now = new Date()): string {
  if (!contract) return 'Belum ada kontrak.';
  const remainingDays = Math.max(0, Math.ceil((new Date(contract.endTime).getTime() - now.getTime()) / 86_400_000));
  return `Club **${contract.clubId}**\nSalary **${formatMoney(contract.salary)}**\nStatus **${contract.state}**\nSisa **${remainingDays} hari**`;
}
