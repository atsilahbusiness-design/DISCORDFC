# Handoff Prompt — Football Rising Star Discord Bot + Client Data Audit

## Status repository

Repository target adalah `https://github.com/atsilahbusiness-design/DISCORDFC`. Commit integrasi client data terbaru adalah `7fb256e`. Branch `main` sudah dipush.

## Data client yang telah diparse

Arsip `FootballRisingStar_2.8.0_Client_Data_Audit.zip` berisi 207 TextAsset payload. Parser berbasis schema binary berhasil membaca seluruh **332/332 record** dari `cfg_club_202603`, termasuk ID, name multilingual, icon, league, country, type, captain, coach, salary base, coach salary base, prestige, grade, formations, dan tactics ID.

Parser fixed-field PlayerConfig berhasil membaca **5.133 record valid** dari header 9.395 pada `cfg_player_202603`: name CN/EN, Num, club, position, price, init age, normal value, auction value, dan grow type. Position mapping mengikuti `PositionId`: FW 1–5, MF 6–9, DF 10–12, GK 13. Ability dictionary variable-length belum dianggap sebagai stat resmi.

Derived data yang masuk repository adalah `data/recovery/club_202603.json` dan `data/recovery/player_202603_fixed_fields.json`. Jangan menyalin binary client mentah ke repository.

## Integrasi runtime

`src/config/recovery-data.ts` membaca derived JSON dengan fallback aman. `createInitialProfile` memilih Arsenal dari league 1011 jika recovery data ada. `ensureClubState` membangun roster dengan nama player client berdasarkan official club ID. `src/domain/official-club-engine.ts` menyediakan `listOfficialClubs` dan `joinOfficialClub`. Discord commands baru adalah `/clubs` dan `/join-club`.

Overall runtime untuk player recovery masih `RECOVERY_INFERRED`, dibentuk dari fixed numeric value karena `GetAbilityScoreByPosition` dan ability dictionary belum diparse penuh. Jangan mengubah label provenance ini tanpa golden test atau data resmi.

## Verifikasi

`pnpm build` lulus. `pnpm test` lulus dengan **18 test, 0 gagal**. Test mencakup official club listing/transfer, recovery club seed, roster names, career, club, competition, economy, contract, achievements, rate limiting, maintenance, dan persistence JSON.

## Tugas lanjutan untuk parity lebih tinggi

1. Parse `cfg_ability`, `cfg_abilityLevel`, dan variable-length `_abilityDic/_allAbilitydic` pada PlayerConfig.
2. Parse `PositionConfig` payload untuk hpConsume, goal/assist/card/injury ratios, initAbility, dan user ratios.
3. Parse `cfg_league`, `cfg_round`, `cfg_roundBattleRule`, `cfg_coachFormation`, dan `cfg_coachTactics` agar fixture/formula tidak lagi inferred.
4. Parse `cfg_coachGameEventUserChoose` cost/reward lists dan localization IDs untuk event yang lebih mirip client.
5. Buat golden tests dari output game asli untuk overall, growth, goal, reward, standings, contract, event, dan market.
6. Lakukan live guild test setelah secret Discord diberikan melalui environment aman.
7. Jangan menghubungkan Firebase/backend endpoint berdasarkan tebakan; audit hanya mengonfirmasi dependency Firebase App/Analytics, bukan Remote Config atau endpoint produksi.

## Security

Jangan memasukkan token Discord, credential database, binary game, atau asset berlisensi ke commit tanpa otorisasi. Gunakan source/config internal yang berwenang untuk parity final.
