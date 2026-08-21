# Deterministic Balance Snapshot

Tanggal snapshot: 2026-08-21. Harness: `scripts/balance-snapshot.ts`. Setiap posisi diuji pada 1.000 profile baru dengan seeded random source dan satu match pada matchday pertama. Hasil ini adalah baseline internal formula bot, bukan telemetri pemain atau hasil backend Football Rising Star asli.

| Posisi | Win rate | Draw rate | Loss rate | Rata-rata gol | Rata-rata balance setelah match | Rata-rata rating |
|---|---:|---:|---:|---:|---:|---:|
| GK | 18,40% | 40,30% | 41,30% | 0,403 | 1.134,07 | 54 |
| DF | 18,20% | 41,50% | 40,30% | 0,424 | 1.134,41 | 56 |
| MF | 25,60% | 40,20% | 34,20% | 0,531 | 1.143,38 | 57 |
| FW | 34,90% | 39,90% | 25,20% | 0,667 | 1.155,32 | 61 |

## Interpretation

Baseline menunjukkan FW memiliki keunggulan yang cukup besar dibanding GK/DF, terutama karena rating awal dan bobot attack. Itu mungkin benar untuk fantasy football, tetapi belum boleh dianggap balance final sebelum perusahaan memberikan target win-rate atau telemetry game asli. GK dan DF memiliki profil defensif, tetapi simulator single-player saat ini tetap menghitung victory terutama dari goal output sehingga kontribusi defensive belum terasa cukup.

Tindakan kalibrasi yang direkomendasikan adalah menguji objective yang berbeda per posisi: clean-sheet/defensive rating untuk GK/DF, chance creation/assist untuk MF, dan goal contribution untuk FW. Perubahan formula harus melalui seeded golden tests, bukan hanya menaikkan angka posisi yang terlihat lemah. Reward money setelah satu match tidak menunjukkan inflasi jangka panjang; analisis lanjutan perlu mensimulasikan beberapa hari, training cost, market purchase, contract salary, dan season rewards sekaligus.

## Reproducibility

```bash
pnpm exec tsx scripts/balance-snapshot.ts
```

Script sengaja disimpan di repository agar balance review dapat diulang setelah perubahan `src/config/game-balance.ts` atau engine pertandingan.
