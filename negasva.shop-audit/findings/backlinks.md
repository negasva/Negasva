# Backlink Profile Audit — negasva.shop

**Date:** 2026-06-23
**Tier:** 0 (Common Crawl + Verify only; no Moz/Bing/DataForSEO configured)

## Data Sources Checked

| Source | Status | Confidence |
|---|---|---|
| Common Crawl web graph | Domain not found (`in_crawl: false`) — too new/small/uncrawled | 0.50 (N/A — no data returned) |
| Verify Backlinks crawler | Not run — no candidate backlink list exists to verify | N/A |
| Moz API | Not configured | — |
| Bing Webmaster | Not configured | — |
| DataForSEO | Not configured | — |

## Findings

negasva.shop returns **zero referring-domain data** from every available Tier 0 source. Common Crawl's latest web graph release (cc-main-2026-jan-feb-mar) has no record of the domain — no PageRank, no harmonic centrality, no referring domains. This is consistent with a newly launched site that hasn't yet been picked up by CC's quarterly crawl or earned any external links indexed elsewhere. There is no known-backlinks list to feed the verification crawler, so no inbound links could be confirmed either.

**Backlink Health Score: INSUFFICIENT DATA (not scored).** Fewer than 1 of 7 scoring factors have any data; assigning a numeric 0-100 score here would be misleading rather than informative. Treat this domain as having an effectively zero off-page footprint today, not a "low score" — there's a difference between "no links" (measured) and "bad links" (also measured), and right now nothing has been measured at all.

## Recommended Low-Cost Link Acquisition Tactics

Given the niche (personalized cartoon-portrait gifts), prioritize channels with natural link/citation value and visual discovery:

1. **Etsy + niche fandom forums** — list on Etsy (gets a profile backlink) and engage authentically in Rick & Morty / Simpsons fan subreddits and forums where custom-art requests are common; many allow portfolio links in profiles/flair.
2. **Pinterest** — treat as a discovery-and-link channel, not just traffic: pin every portrait with a direct product-page link; visual products convert well there and pins are indexable, link-bearing assets.
3. **Gift-guide outreach** — pitch small blogs/YouTubers doing "best personalized gifts" or "gifts for [fandom] fans" roundups, especially around holidays; low competition, high relevance.
4. **Local/niche business directories and Etsy alternative marketplaces** (e.g., Notonthehighstreet-style sites if applicable) for foundational citations.
5. **Customer UGC incentive** — offer a small discount for customers who post their portrait on Instagram/TikTok/Reddit tagging the shop; generates organic mentions and occasional backlinks from fan accounts.

## Next Steps

- Re-run Common Crawl check next quarterly release to see if the domain has been picked up.
- Add a Moz API key (free tier, 2,500 rows/month) to unlock DA/PA, spam score, and a real referring-domains list — current sparse data is a hard ceiling on what this audit can report at Tier 0.
- Once the site has any inbound links (even a few), re-run `verify_backlinks.py` against a manually compiled list (Etsy profile, Pinterest, any forum mentions) to confirm they resolve and link as expected.
