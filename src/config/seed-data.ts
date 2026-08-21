import type { Position } from '../domain/types.js';

export const SEED_CLUB_NAMES = ['Rising City FC', 'Harbor Athletic', 'Northbridge United', 'Metro Stars', 'Royal County', 'Eastlake Rovers', 'Mountain Eleven', 'Capital Sporting', 'Golden Valley', 'Blue River FC'];
export const SEED_PLAYER_NAMES = ['Arga Pratama', 'Bima Nugraha', 'Cakra Wibowo', 'Dimas Mahesa', 'Eka Putra', 'Fajar Ramadhan', 'Gilang Aditya', 'Hadi Kusuma', 'Indra Saputra', 'Jaka Wirawan', 'Krisna Wijaya', 'Lukman Hakim', 'Miko Ananta', 'Nanda Surya', 'Oki Firmansyah'];
export const SEED_ROSTER_POSITIONS: Position[] = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'DF', 'MF', 'FW'];

export const SEED_MARKET_PLAYERS = [
  { id: 'market-1', name: 'Rafi Alvaro', position: 'FW' as const, overall: 68, price: 1_200 },
  { id: 'market-2', name: 'Satria Malik', position: 'MF' as const, overall: 65, price: 950 },
  { id: 'market-3', name: 'Tio Baskara', position: 'DF' as const, overall: 70, price: 1_350 },
  { id: 'market-4', name: 'Yusuf Hendra', position: 'GK' as const, overall: 67, price: 1_100 }
];
