# Meta Pixel Phase 1

## Configuration

Set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel for Production and Preview. Leave it empty when tracking is not configured; the site continues to work without the Pixel. The ID is public by design. Never add Meta access tokens or server secrets to this variable.

## Browser events

- Public page load: `PageView`.
- Client-side public navigation: one additional `PageView` per route change.
- Course detail: `ViewContent` with course name, `formation` category, course slug and locale.
- Meaningful registration interaction: `InitiateCheckout` with course, study mode and locale.
- Confirmed successful registration API response: `Lead` with course, study mode and locale.
- Failed validation or API submission: no `Lead`.

Names, phone numbers, email addresses, messages, CVs, payment data and CRM notes are never sent to the browser Pixel.

## UTM and Meta attribution

Existing UTM fields and referrer are preserved for the current browser session and submitted through the existing registration payload. `fbclid`, `_fbp` and `_fbc` are not written to Supabase because that would require an approved schema change; they remain a Phase 2 server-side attribution concern.

## Testing after deployment

1. Add `NEXT_PUBLIC_META_PIXEL_ID` to Vercel and redeploy.
2. Open Meta Events Manager → Test events and use the production URL.
3. Confirm one `PageView` on a fresh public page load.
4. Navigate from `/fr` or `/ar` to a course detail and confirm `ViewContent`.
5. Focus or begin the registration form and confirm `InitiateCheckout` once.
6. Submit a valid registration and confirm one `Lead` only after the API succeeds.
7. Submit invalid data or simulate an API failure and confirm no `Lead`.
8. Verify no event parameters contain PII.

## Phase 2 boundary

The browser maps a successful website registration to `Lead`. CRM movement to Pré-inscription should later emit a server-side `MeritifyPreRegistration` event, and Inscription finale should emit `CompleteRegistration`. Verified payments must be handled separately with correct value, currency and partial-payment logic. Meta Conversions API, access tokens and event-id deduplication are intentionally not implemented in Phase 1.
