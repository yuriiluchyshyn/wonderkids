# Privacy policy

In force from {{updated}}.

This policy says what personal data Pulsar Kids processes when a family uses the site {{site}} and the game, why, and what a parent can do about it. It is written for parents: children do not create accounts and are not asked to agree to anything.

## 1. Who is responsible for the data

The controller of the personal data is **{{operator.name}}**, {{operator.address}}, {{operator.id}} — below, “Pulsar Kids”.

Questions and requests about personal data are answered at [{{operator.email}}](mailto:{{operator.email}}). Pulsar Kids has not appointed a data protection officer.

## 2. The short version

- An account is created by an adult — a parent or a legal guardian. A child's profile is filled in by the parent; the child signs in with a nickname and a PIN.
- There are no ads, no advertising trackers and no analytics cookies. Data is not sold and is not passed to advertisers.
- A parent can see, correct, download and delete the family's data in the parents' area at any time.

## 3. What is processed, why, and for how long

| Data | What for | Legal basis (GDPR) | Kept |
|---|---|---|---|
| **Parent account**: email address, language, the date the account was made, when the game or the parents' area was last opened. The sign-in itself is kept by Auth0: a password only as a hash, or the Google account used to sign in. | To make the account, let the parent sign in, and send messages about the service. | Contract — art. 6(1)(b) | Until the account is deleted |
| **Child profile**, entered by the parent: a name or nickname, a sign-in nickname, a PIN, gender (so that the texts are grammatically right), year and month of birth (to offer games for the right age), the chosen theme and settings. | So that the child can sign in and play in a profile of their own. | Contract with the parent — art. 6(1)(b) | Until the profile or the account is deleted |
| **Play data**: the step reached in each game, tasks done, hints shown, rewards, what is built in the child's world, family goals typed in by the parent, play time per day and per session. | To keep progress on every device, to keep the screen-time limits a parent set, and to show the parent how the child is doing. | Contract — art. 6(1)(b) | Until the profile or the account is deleted |
| **Where the account came from**: the labels of the link or ad that led to the site, or the site that referred the visitor. Saved once, when the account is made. | To know which channels bring families. | Legitimate interest — art. 6(1)(f) | Until the account is deleted |
| **Arrivals by a Pulsar Kids link and trial games**: time, the link, country (worked out from the IP address), language, type of device, the referring site, and a keyed hash of the IP address that cannot be turned back into the address; for a trial game — whether it was played to the end and whether “create an account” was pressed. | To count visits and trial games without identifying anyone. | Legitimate interest — art. 6(1)(f) | 24 months |
| **Messages from the site's form**: the text, its kind, an email address if given, attached photos or videos, a keyed hash of the IP address and the type of browser. | To answer, to fix the game, and to stop abuse of the form. | Legitimate interest — art. 6(1)(f) | 24 months. Attachments are not stored on the server: they are forwarded to the Pulsar Kids mailbox with the message. |
| **Technical logs**: IP address, time, the address requested, type of browser. | To deliver the pages and keep the service secure. | Legitimate interest — art. 6(1)(f) | Up to 30 days, at the hosting provider |
| **Subscription payment** (only when a parent subscribes): email address, name, billing address, the chosen plan and number of kids. Card details are typed into Stripe's window and never reach Pulsar Kids. | To set up and renew the subscription, issue invoices and determine the buyer's country for tax. | Contract — art. 6(1)(b); legal obligation (tax) — art. 6(1)(c) | While the subscription lasts; invoices as long as tax law requires (5 years in Poland) |
| **Anonymous page statistics** (Vercel Web Analytics): the page, the referring site, country, type of device and browser. No cookies, and no identifier that lasts longer than a day. | To see which pages are read. | Legitimate interest — art. 6(1)(f) | Only as totals |

A child's first name or a nickname is enough. Please do not enter a surname, an address, a school or a photo — the game needs none of them. An email address is needed to have an account; everything else in a profile is the parent's choice.

Texts the game reads aloud — tasks, hints, and the family goals a parent typed in — are sent to Google's speech service as text only, without anything that identifies the account or the child.

## 4. Children

- Only an adult parent or legal guardian can make an account. Everything known about a child is entered by that adult or arises as the child plays.
- A child's data is processed under the contract with the parent, not on the child's consent.
- Nothing is advertised to children, no advertising profile is built, and there is no chat, no public profile and no contact between players.
- The game looks at a child's answers only to choose the next tasks and hints. No decision with a legal or similarly significant effect is made automatically.
- The trial game needs no account and asks for no name. Only the arrival described in section 3 is recorded.
- A parent can look through, download or delete a child's data in the parents' area, and can stop any further collection by deleting the profile — or by writing to [{{operator.email}}](mailto:{{operator.email}}). This applies to families in the United States too (COPPA).

If you believe a child has given Pulsar Kids personal data without a parent, write to the address above and it will be deleted.

## 5. Cookies and storage on the device

Pulsar Kids uses no advertising cookies and no analytics cookies, so there is no cookie banner to answer. What is kept on a device is listed here.

| Name | Kind | What for | How long |
|---|---|---|---|
| pk_lang | Cookie, pulsarkids.com and its subdomains | The language chosen for the site and the game | 1 year |
| wk-auth | Cookie, pulsarkids.com and its subdomains | Notes a sign-in or sign-out, so that the child's game and the parents' area end an old session together | 400 days |
| __stripe_mid, __stripe_sid | Cookie, pulsarkids.com | Set by Stripe only when the payment window is open, to detect fraudulent payments | 1 year and 30 minutes |
| Auth0 cookies | Cookies, auth.pulsarkids.com | Carry a parent through the sign-in | The sign-in session |
| wonderkids-auth-v1 | Local storage, game | Keeps the parent or the child signed in | Until sign-out, 30 days at most |
| pulsar-lang-v1, pulsar-availability-v1, wk-last-theme-v1, wk-outro-v1 | Local storage, game and site | The chosen language, which games are offered in the country, the last theme (for the loading screen), which fact was told last | Until cleared in the browser; all but the language also at sign-out |
| pulsar-source-v1 | Local storage, site and game | The labels of the link or ad that brought the visitor; sent once, when an account is made | Until sign-out or until cleared |
| pulsar-demo-v1, wk-hub-v2, pulsar-visit-… | Session storage | The trial game in progress, the filters of the game list, a mark that an arrival was already counted | Until the tab is closed |

All of it can be removed in the browser's settings. Without the sign-in entries the game cannot keep anyone signed in.

## 6. Who receives the data

Pulsar Kids uses service providers that process data on its behalf and under contract:

| Provider | What it does | Where |
|---|---|---|
| Vercel Inc. | Hosts the site, the game and the API; anonymous page statistics | USA, with a delivery network worldwide |
| Neon, Inc. (Databricks) | The database with accounts, profiles and progress | USA |
| Okta, Inc. (Auth0) | Sign-in of parents | USA |
| Google Ireland Ltd. / Google LLC | Reading texts aloud (text only); the Pulsar Kids mailbox | EU and USA |
| Stripe Payments Europe, Ltd. | Takes subscription payments, keeps card details, issues invoices | EU and USA |
| Resend, Inc. | Sends messages from the site's form to the mailbox and replies to their senders | USA and EU |
| ImprovMX | Forwards mail sent to addresses at pulsarkids.com | EU and USA |

Some of these providers are in the United States. Data goes there on the basis of the European Commission's adequacy decision for the EU–U.S. Data Privacy Framework where the provider is certified under it, and otherwise on the Commission's standard contractual clauses. A copy of the safeguards can be asked for at the address in section 1.

Data is given to public authorities only where the law requires it. It is never sold.

## 7. Deleting data

Deleting a child's profile or the whole account in the parents' area removes the data from the database at once. Copies in the database provider's backups disappear within 30 days. The sign-in record at Auth0 is deleted on request to [{{operator.email}}](mailto:{{operator.email}}).

## 8. Your rights

You have the right to access your data and your child's, to have it corrected or deleted, to restrict its processing, to receive it in a machine-readable form, and to object to processing based on legitimate interest.

- In the parents' area you can change a profile, download all of the family's data as a file, delete a child's profile and delete the account.
- Anything else: write to [{{operator.email}}](mailto:{{operator.email}}). A reply comes within one month.

You may also complain to a supervisory authority — in Poland the President of the Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa, [uodo.gov.pl](https://uodo.gov.pl)) — or to the authority of the EU country where you live.

## 9. Security

Everything travels over an encrypted connection (HTTPS). Parents sign in through Auth0; access to the database is limited to the operator. A child's PIN is a simple code that keeps brothers and sisters out of each other's profiles, not a password — please do not use a code that protects anything else.

## 10. Changes to this policy

When the policy changes in a way that matters, parents with an account are told by email or in the parents' area before the change takes effect. The date at the top shows the current version.
