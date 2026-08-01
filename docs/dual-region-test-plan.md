# Dual-region test plan

1. RU country lead submits only to RU API.
2. RU country lead has no request to `*.supabase.co`.
3. RU IP with US selection routes RU.
4. `+7` phone with no Kazakhstan confirmation routes RU.
5. Conflicting signals route RU.
6. Russian locale with insufficient signals routes RU.
7. Existing international conversation remains international.
8. Existing RU conversation remains RU.
9. User-edited hidden route value is ignored.
10. Public token does not reveal DB ID.
11. RU file upload never uses Supabase Storage.
12. RU auth registration never calls Supabase Auth.
13. RU password reset token is one-time and not logged.
14. RU Realtime uses RU provider or polling only.
15. RU backend unavailable returns error/maintenance, not Supabase fallback.
16. Telegram notification contains no name/email/phone/text/file URL/IP/UA.
17. Admin list shows explicit region for every item.
18. Admin action writes only to origin region.
19. Data subject deletion removes/anonymizes origin data and storage.
20. RU CSP/connect-src monitor fails on denied hosts.
