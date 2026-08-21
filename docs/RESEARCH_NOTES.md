# Professional Research Notes

Tanggal audit: 2026-08-21.

## Discord platform

Discord mengharuskan interaction di-acknowledge dalam jendela waktu singkat; operasi yang berpotensi lambat harus memakai defer lalu edit/follow-up. Dokumentasi resmi juga memodelkan interaction sebagai webhook-like request dengan token continuation dan metadata permission, guild, channel, locale, serta application permissions [1].

Discord menyatakan bahwa rate limit tidak boleh di-hard-code sebagai asumsi API. Client harus menghormati response headers dan `retry_after` pada HTTP 429, termasuk membedakan scope global, user, dan shared [2]. Saat ini bot memiliki game-level in-memory rate limiter, tetapi belum memiliki telemetry untuk Discord API invalid-request rate maupun distributed limiter.

Application command memiliki maksimal 25 options, global/guild scope, konteks guild/DM, dan global command create limit 200 per guild per hari. Command permission dapat dikontrol oleh admin server melalui Integrations, dan command dapat dibatasi per role/member/channel [3] [4].

Message components resmi mendukung buttons, string selects, modals/text inputs, dan autocomplete. Komponen dapat mempersingkat UX game, tetapi custom ID harus unik per component dan panjangnya 1–100 karakter; legacy components tetap valid, sementara Components V2 memiliki flag dan aturan message yang berbeda sehingga sebaiknya diadopsi secara bertahap [5] [6].

## Game economy and engagement

Unity menekankan bahwa ekonomi harus memetakan sources dan sinks berdasarkan tipe pemain, keterlibatan, dan fase perjalanan pemain. Variabel seperti initial currency, periodic reward, cooldown energy, cost progression, dan reward progression cocok untuk A/B test, bukan diubah tanpa telemetry [7]. GDC menjelaskan bahwa sink efektif menjaga economy tetap seimbang dan merekomendasikan simulasi spreadsheet untuk melihat dampak sink terhadap mata uang/item [8].

Riset ACM terhadap engagement rewards menemukan bahwa daily login/repeatable/seasonal rewards dapat terasa memotivasi, tetapi juga bisa dianggap kewajiban, FOMO, atau chore. Karena itu, daily reward bot sebaiknya memiliki catch-up window, pilihan pemain, dan nilai yang tidak menghukum pengguna yang absen [9].

## Security and privacy

OWASP Node.js guidance menekankan allowlist input validation, async/non-blocking execution, activity logging, error handling, dependency hygiene, dan access control [10]. OWASP API Security Top 10 menyoroti broken object-level authorization, broken function-level authorization, unrestricted resource consumption, unrestricted sensitive business flows, security misconfiguration, improper inventory, dan unsafe consumption of third-party APIs [11].

Riset USENIX tentang bot pada group chats menunjukkan bahwa bot dapat mengakses pesan lebih banyak dari yang diperlukan dan menimbulkan risiko korelasi identitas lintas grup. Untuk bot ini, prinsip minimisasi data berarti memakai hanya interaction payload yang diperlukan, tidak membaca message content intent, tidak logging isi pesan, dan tidak menampilkan user data di leaderboard tanpa persetujuan product/privacy [12].

## Implications for DISCORDFC

Prioritas teknis yang disarankan adalah memisahkan command handlers menjadi use-case service, menambahkan defer untuk operasi DB/admin/season, memakai transactional mutation dengan version/optimistic locking, mengganti in-memory rate limit dengan storage-backed bucket pada multi-instance, menambah idempotency key berbasis interaction ID, serta menambahkan event ledger yang dapat direkonsiliasi.

Prioritas game design adalah menambah source/sink dashboard, catch-up daily reward, stamina/energy caps yang dapat dikalibrasi, non-punitive absence recovery, social league/co-op yang opt-in, dan golden simulation tests sebelum membuka monetization. Jangan menambahkan loot box berbayar atau mekanik FOMO tanpa review legal/product dan telemetry yang memadai.

## References

[1]: https://docs.discord.com/developers/interactions/receiving-and-responding "Discord — Receiving and Responding to Interactions"
[2]: https://docs.discord.com/developers/topics/rate-limits "Discord — Rate Limits"
[3]: https://docs.discord.com/developers/interactions/application-commands "Discord — Application Commands"
[4]: https://support-apps.discord.com/hc/en-us/articles/26501869403159-Command-Permissions "Discord — Command Permissions"
[5]: https://docs.discord.com/developers/components/reference "Discord — Component Reference"
[6]: https://docs.discord.com/developers/components/using-message-components "Discord — Using Message Components"
[7]: https://unity.com/how-to/design-balanced-in-game-economy-guide-part-3 "Unity — Designing a balanced in-game economy"
[8]: https://gdcvault.com/play/1020524/Economic-Balancing-and-Improved-Monetization "GDC Vault — Economic Balancing and Improved Monetization Through Clever Sink Design"
[9]: https://doi.org/10.1145/3549489 "ACM CHI PLAY — Daily Quests or Daily Pests?"
[10]: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html "OWASP — Node.js Security Cheat Sheet"
[11]: https://owasp.org/www-project-api-security/ "OWASP — API Security Project"
[12]: https://www.usenix.org/conference/usenixsecurity25/presentation/chou "USENIX Security 25 — Bots can Snoop"
