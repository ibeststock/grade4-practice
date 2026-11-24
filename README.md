# Grade 4 Reading & Writing Practice

Six FAST-style practice tests for 4th grade. Each test has two passages with different text structures, reading questions, and a writing task that uses both passages.

**Open the tests:** https://ibeststock.github.io/grade4-practice/

### Reading & Writing

| Test | Level | Passages | Writing |
|---|---|---|---|
| 1 | On level | Alligators vs. crocodiles · Sea turtles | Expository |
| 2 | Challenge | Marjory Stoneman Douglas · Pythons | Argumentative |
| 3 | On level | Manatees · A manatee rescue | Expository |
| 4 | Challenge | Coral reef nurseries · Reefs vs. rainforests | Argumentative |
| 5 | Advanced | Launch-day story · Rocket science | Argumentative |
| 6 | Advanced | How hurricanes form · Storm poem | Expository |
| 7 | Challenge | Lighthouse poem · How lighthouses solved sailors’ problems | Expository |

**Glossary:** like the real FAST, each reading passage has 3 harder words underlined with a small number. Tap a word to see its meaning, or read the Glossary at the end of the passage. Glossary words never overlap a vocabulary question.

**Live answers (parents):** on the dashboard, press **● Live answers** next to any started test to see each answer as it's given: right ✓, not right ✗, or not answered yet, next to the correct answer and a short "why". It refreshes every 10 seconds and shows the essay as it's written. It also shows her **first-try answers**: the answer she had the first time she moved on from each question, along with which ones she later fixed or changed from right to wrong, and a first-try score. When a test is retaken, earlier tries (scores and dates) are kept. To keep students from peeking, it asks for the family code once per browser session.

### Math (FAST-style, 40 questions each, no calculator)

| Test | Level | Topics |
|---|---|---|
| Math Practice 1 | On level | Place value, fractions, angles, line plots |
| Math Practice 2 | Challenge | Multi-digit operations, mixed numbers, protractors, data |
| Math Practice 3 | Advanced | Multi-step problems, error analysis, composite area, data |

**Word Problem Drills** (in the Math section): 5 sets of 10 story problems that teach *which operation to use*. For each problem the student picks the operation (+ − × ÷), picks the matching number sentence, then solves it. Instant feedback lights up the key phrase in the story and shows a bar model. Sets: Add or Subtract? · Multiply or Divide? · "More Than" or "Times As Many"? · All Four Operations · Two-Step Problems. The dashboard shows points and which operations get mixed up.

Each math test follows Florida's Grade 4 FAST blueprint: about one-third whole numbers & algebra, one-third fractions & decimals, and one-third geometry, measurement & data.

Printable versions with answer keys are in [`pdfs/`](pdfs/). Reading tests include lined writing pages.

## Saving progress to a Google Sheet (about 5 minutes, once)

Without this step, progress saves only in the browser on each device.

1. Create a new Google Sheet (sheets.new). Name it "Grade 4 Practice Progress".
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the starter code. Paste in everything from [`Code.gs`](Code.gs).
4. On the line `const FAMILY_CODE = 'CHANGE-ME';`, replace `CHANGE-ME` with a code only your family knows. Click **Save**.
5. Click **Deploy → New deployment**. Click the gear icon and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, then **Authorize access**, and allow it with your Google account. Google may warn that the app isn't verified. Click **Advanced → Go to (project name)**, because this is your own script.
7. Copy the **Web app URL** (it ends in `/exec`).
8. Open the tests page, click **Connect a Google Sheet**, then paste the URL and your family code.

**Other devices:** on the tests page, open **Progress dashboard → Use the tests on another device**, copy the setup link, and open it once on the other device.

**What gets saved:** student first names, answers, essays, highlights, time spent, and scores. Saved data goes only to your Google Sheet. The Progress tab is easy to read in the Sheet itself.

## Student log-in

Each student taps their name and types a 4-digit PIN. The first time, they create the PIN. PINs are stored in the Students tab as scrambled codes, never as the real digits. After 10 wrong tries, that student is locked out for 10 minutes.

**Forgot a PIN?** Open the Google Sheet, go to the Students tab, and clear that student's cell in the `pin` column. Next time, they'll make a new PIN.

**Updating the script later:** after editing `Code.gs`, use **Deploy → Manage deployments → Edit → Version: New version**. This keeps the same URL.
