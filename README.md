# Paste Guard

Strips names, phone numbers and ID numbers out of case notes in the browser before they are pasted into an AI assistant, and puts them back in the answer.

**Live demo:** https://tonihaddad.github.io/paste-guard/ (all sample data is synthetic)

![Paste Guard with the English sample note](docs/screenshot-english.png)

## The need

Staff at a humanitarian organization in Lebanon want an AI assistant's help with the notes they write every day: a social worker's case note from a centre, a complaint taken on the hotline, a note from a shelter opened in a school during an emergency, a message to a warehouse about a delivery to a named family, a rent follow-up with a landlord's name and IBAN. Each one carries names, phone numbers and ID numbers. Policy says do not paste personal data; in practice people paste it. This gives them a safe way to do what they were going to do anyway: redact in one click, paste the redacted text, then restore the real values in the answer.

It is one HTML page and plain JavaScript. No framework, no build step, no CDN, no server logic. It works offline and makes no network request after it loads. Notes can be in Arabic, French or English.

## Try it

```
npm start
```

```
Paste Guard on http://127.0.0.1:8109/  (Ctrl+C to stop)
```

Open that address and press a sample button. Opening `index.html` directly also works. Node 20 or newer is the only requirement. `npm test` runs the tests, `npm run bench` runs the benchmark.

## How it works

| Step | What happens |
|---|---|
| 1. Paste a note | `src/detect.js` finds personal data. It has no DOM dependency, so Node tests it directly. |
| 2. Read the redacted text | Each value becomes a stable placeholder such as `[PERSON_1]` or `[PHONE_2]`. The same value always gets the same placeholder in a session, so the text still makes sense to the assistant. Click a coloured span to put the original back. Select any text and press the button to redact it too. |
| 3. Paste the answer back | Placeholders in the assistant's answer are swapped for the real values. Lost brackets and case changes are tolerated. |

What is detected:

- **Phones**: Lebanese mobile and landline numbers, with or without +961, and international numbers (a relative abroad). Arabic-Indic digits work. The same number written two ways gets one placeholder.
- **Emails and IBANs** (Lebanese IBANs by length, others by checksum).
- **Dates of birth**, only after a cue (born, DOB, née le, تاريخ الميلاد, من مواليد). A visit date or a contract end date is left alone.
- **ID and passport numbers**, after a cue (passport, carte d'identité, رقم الهوية, ...) or in the shape of a passport number (`RL4567812`).
- **Case and registration numbers** in a **fictional** format invented for this project: `CS-2026-004817` (social work case), `HL-2026-000312` (hotline complaint), `FAM-2026-01234` (family registration). No real organization uses it. Waybill and receipt numbers such as `DSP-2026-00412` are deliberately not treated as personal.
- **Names.** There is no name-recognition model. The detector combines:
  - cues: titles (Mr, Mrs, Dr, Madame, M., السيد, السيدة, الدكتورة, Hajj, الحاج), relations and roles ("son of", "fils de", "her cousin", "the landlord", زوجها, المالك, السائق), labels ("Caller:"), kunya (Abou Elias, أبو خالد, أم علي);
  - a bundled list of about 1,300 common Lebanese and regional given and family names, in Latin and Arabic script, plus French given names common in Lebanon (`src/gazetteer.js`);
  - particles and compound names: `Abdel Nasser`, `Abd el Kader`, `عبد الله`, `عبد الرحمن`, `Abou Elias`, `أبو`, `Bou Khalil`, `بو`, `Abi Nader`, `El Hajj`, `Al-Masri`, `ابن`/`بن`, and names ending in الدين or el Din;
  - your own list of extra names, in any script;
  - repeat finding: once a name is found, its other mentions, including a first name alone, are found too;
  - an optional strict mode that redacts every capitalised word that does not start a sentence.

Words such as "hope" or "نور" are also names, so they only count next to another name or after a cue.

## The privacy claim, and how it is enforced

- The page carries a Content-Security-Policy with `connect-src 'none'`: the browser itself refuses any network request from it. I checked it from `file://` and over HTTP, and offline after load: the browser made no request other than the page's own files.
- The mapping from placeholders to real values is a plain `Map` in the page's memory. It is never written to browser storage and is gone when the tab closes.
- `tests/no-network.test.js` fails the build if the shipped code mentions fetch, XMLHttpRequest, WebSocket, sendBeacon, local or session storage, cookies, IndexedDB, eval and similar. It also checks that the CSP is present, that every script is a local file with no inline code, and that the page loads nothing from outside.

This is evidence for the code in this repo. It does not protect text after you paste it into an assistant, which is the point of redacting it first.

## Results

The benchmark is 60 synthetic notes, 20 each in English, French and Arabic, with 249 labelled entities. Each language has four notes of each of the five kinds above. `npm run bench` prints the tables. Recall is the number that matters, because a missed name is a leak.

- **Recall** = share of labelled entities that are fully covered by detected spans. A name with its surname left behind counts as missed.
- **Precision** = share of detected spans that overlap a labelled entity of the same type.

How the notes were split and used:

- **dev** (10 per language): the only notes used for tuning.
- **heldout** (5 per language) and **stress** (5 per language, informal, few cues, uncommon names): written and labelled before any detection code was changed for this setting, and not tuned on. The baseline below was measured first, with the previous detector on the new notes. Honest caveat: I read the baseline list of misses once before writing the name list, and I wrote the list myself, so it is not independent of what I know about these notes. The "name list switched off" rows show how much the list contributes.

### Name recall, before and after (the weak point)

PERSON only. Before = the detector as it was for the previous setting; after = this version.

| Split | Before | After |
|---|---|---|
| dev (tuned on) | 100% (61 of 61) | 100% (61 of 61) |
| heldout | 66.7% (20 of 30) | 90.0% (27 of 30) |
| **stress** | **61.0% (36 of 59)** | **74.6% (44 of 59)** |
| stress, English | 81.0% (17 of 21) | 90.5% (19 of 21) |
| stress, French | 64.7% (11 of 17) | 82.4% (14 of 17) |
| stress, Arabic | 38.1% (8 of 21) | 52.4% (11 of 21) |

Stress names with the name list switched off (cues and repeat finding only): 33.9% (20 of 59). The list roughly doubles name recall on informal notes.

### All entity types, final run

```
RECALL AND PRECISION, ALL NOTES, BY ENTITY TYPE
group           gold  found  recall  preds correct precision
PERSON           150    132   88.0%    134     132   98.5%
PHONE             43     43  100.0%     43      43  100.0%
EMAIL              3      3  100.0%      3       3  100.0%
IBAN              12     12  100.0%     12      12  100.0%
DOB                9      9  100.0%      9       9  100.0%
ID                11      9   81.8%      9       9  100.0%
CASE              21     21  100.0%     21      21  100.0%
ALL              249    229   92.0%    231     229   99.1%

BY LANGUAGE
group           gold  found  recall  preds correct precision
en                85     83   97.6%     84      83   98.8%
fr                80     76   95.0%     76      76  100.0%
ar                84     70   83.3%     71      70   98.6%

BY SPLIT
group           gold  found  recall  preds correct precision
dev              111    111  100.0%    110     110  100.0%
heldout           54     50   92.6%     51      51  100.0%
stress            84     68   81.0%     70      68   97.1%

STRICT MODE, PERSON ONLY, STRESS SPLIT
group           gold  found  recall  preds correct precision
en stress         21     21  100.0%     22      21   95.5%
fr stress         17     16   94.1%     16      16  100.0%
ar stress         21     11   52.4%     12      11   91.7%
```

The full output, with every miss and a by-language-and-type table, is in `docs/benchmark-output.txt`; the baseline run is in `bench/before-rebase.txt`. The baseline has 0% on case numbers only because the case-number format changed; that is not a detection result.

How to read these numbers:

- **Structured identifiers are reliable on this data**: all phones, emails, IBANs, dates of birth and case numbers were found, and 9 of 11 ID numbers. The notes use the formats the detector was built for, so this measures the patterns, not every format in the field.
- **Names are the weak point.** Perfect on the notes I tuned on, 90% on held-out, **74.6% on stress**. For real notes, which have more unusual names and fewer titles, expect the stress figure or worse.
- **The notes are small and written by me**, the same person who wrote the detector and the list. They are not real case notes.
- **Strict mode** lifts stress recall for names to 100% in English and 94% in French, at the cost of precision (it also catches places and organisations). It does nothing for Arabic, which has no capital letters.

## Where it fails

Names with no cue, that are not in the list, are missed. Real misses from the final run (`npm run bench`, section "MISSED"):

| Note | Missed | Why |
|---|---|---|
| en-19 | `Charbel` ("Hello Charbel, can you load...") | a very common name that my list does not have, and a greeting is not a cue |
| en-16 | `Tamar Kasparian` | an Armenian-Lebanese name, not in the list, no title |
| fr-18 | `Taline`, `Bertille` | uncommon given names with no cue |
| ar-18 | `منى` (alone), `طوني`, `زخيا` | `منى` is also an ordinary word, so it needs a cue; Tony and Zakhia are not in the Arabic list |
| ar-19 | `شربل`, `عفيف داود`, `نصري`, `هالة` | not in the Arabic list, no cue |
| ar-16 | `تمار قصباريان` | unknown name, and Arabic has no capital letters to hint at it |
| ar-14 | `إيفون` (only `جرجس` is caught) | "للسيدة" (to the lady) is the title with a prefix merged in, and the title rule does not see it |
| ar-13 | `ماري`, `زين` | "الأخت" (Sister) is not a cue; `زين` after "وعائلة" (and the family of): the cue rule does not allow the prefix و |
| fr-14 | ID `123456789012` after "carte" | the ID cue wants "carte d'identité", not "carte" |
| ar-20 | ID `٤٤٥٥٦٦٧٧٨٨` after "هويتها رقم" | the cue list has الهوية, not the possessive هويتها |

False alarms in the same run: `Hammoud` in "Bourj Hammoud" (a place that is also a family name) and `خال` in "ابن خال" (cousin).

Arabic is weakest (52.4% name recall on the stress notes) for a structural reason: without capital letters the tool cannot tell an unknown name from a noun, so it leans on the list and on cues.

**What the page tells the user.** A yellow notice above the work area says: read the redacted text before you paste it, names are harder than numbers, and a name with no cue that is not in the list can slip through. The English sample contains such a name on purpose ("Gaelle") and the page asks the user to find it and select it. Strict mode and the extra names list are the two ways to catch more.

Other limits: a first name and the full name get separate placeholders unless the first name was found as part of the full name's repeat search; a typo in a name is not matched; scanned images and PDFs are out of scope; the name list leans towards Lebanese communities and will miss names from other origins.

## Tests

`npm test` runs 43 tests with Node's built-in runner (`node --test`), also in GitHub Actions on Node 20 and 22:

- detection for each type and format, including Arabic-Indic digits, numbers that are not phones, and spans that must never overlap;
- particles and compound names in Latin and Arabic script;
- redaction: stable placeholders, restore round trip on every benchmark note, un-redact, assistant-mangled placeholders;
- the no-network and no-storage guard described above, and a bidi check for restored Arabic-Indic numbers;
- benchmark floors: structured identifiers found, name recall floors, precision floor, strict mode beats default.

## What I would add next

- Run a small on-device name model (for example a quantised NER model in the browser) as an extra layer for names with no cue, and measure it on the same stress notes.
- Let the user save their extra-names list as a file they control, so it survives a reload without the page storing anything itself.

## Licence

MIT. See `LICENSE`. All sample data is synthetic.
