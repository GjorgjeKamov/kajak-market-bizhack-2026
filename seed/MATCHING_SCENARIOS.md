# Matching test scenarios (fictional data in seed/sample_data.sql)

Run these as buyer chats (or compare against the seeded buyer requests) in the TEST environment.
"Expected" describes intended behaviour of src/lib/market.server.ts matching; it is not a recorded result.

| # | Buyer request | Expected outcome |
|---|---|---|
| 1 | 800 kg tomatoes, 45 MKD/kg | Approved tomato producers listed; same-currency price compared |
| 2 | 1000 kg grapes, 0.9 EUR/kg | Grape producers (EUR) listed; price counts (same currency) |
| 3 | 50 kg honey, 11 EUR/kg | Honey producers listed |
| 4 | 500 kg apples, no price | Apple producers listed; price ignored |
| 5 | 100 kg cheese, 60 MKD/kg | Cheese is priced in EUR: price neither helps nor hurts; no conversion |
| 6 | 300 kg peppers, 50 MKD | Pepper producers listed |
| 7 | 200 kg walnuts, 6 EUR | Walnut producers listed |
| 8 | 10 head lamb, 130 EUR | Lamb producers listed; unit "head" preserved |
| 9 | 1000 kg rice, 85 MKD | Rice producers listed |
| 10 | 100 kg avocado | No match: assistant says nothing found, invents nothing |

Privacy checks for every scenario: the pending producer (#18) never appears; a producer phone
is shown only where phone_public_consent = true.
