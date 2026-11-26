// Official English source texts. Bump a version whenever its English text changes:
// translations approved for an older version are then no longer shown.
export const LEGAL = {
  privacy: { version: "2026-11-6", text: {
    title: "Privacy Policy",
    banner: "Draft pending legal review. The English text is the original.",
    body: `Policy version 2026-11-6.

## Data controller
Owner, operator and data controller of KAJAK.MARKET: **DTU KAJAK AGENCIJA DOOEL SKOPJE**, Emil Zola 7/1/1-40, Skopje – Centar, Macedonia. Registration number (EMBS): 7555431. Tax number (EDB): MK4080021602548. Contact and privacy requests: contact@kajak.mk. The company handles data protection itself; there is no separately named data protection officer. These company details refer only to the operator, not to registered users.

## What we collect
- Anyone may register as a private individual; no company, tax, VAT or registration documents are required.
- Sellers: name, country, city or village, producer type, products, quantities, seasons, prices, delivery options, telephone, optional email.
- Buyers: name, location, optional business name and type, requested products, quantities, delivery details, telephone, optional email, feedback.
- Your consent answers, with their wording, time and policy version.
- Information you type or say in the registration chat is saved automatically as you go, so nothing is lost if you leave early. An unfinished registration is stored privately and is never shown to buyers. It is used to let you resume the conversation on the same device, which keeps a random key in your browser, and to let authorised KAJAK.MARKET administrators manage registration records, review data completeness and provide marketplace support.
- To show the site in your language we read your approximate country from our hosting provider for each visit. Your IP address is not stored for this purpose.

## AI and voice processing
The registration chat is run by an AI model that reads your messages to collect your details. Voice messages are converted to text by an AI transcription service. KAJAK.MARKET does not store the recordings; only the resulting text is used. These services are reached through the Lovable AI Gateway (Lovable Labs Incorporated) and are currently provided by OpenAI, acting as processors on our behalf. Under their own terms, these providers may keep request data for a limited period, for example for abuse monitoring, and do not use it to train their models. We have not independently verified their retention periods. Matching between buyers and producers is done by our own rules, not by automated decisions with legal effects.

## Service providers and international transfers
- Lovable (Lovable Labs Incorporated): website hosting, database and authentication (Lovable Cloud), and the AI Gateway.
- Supabase Inc.: the database infrastructure behind Lovable Cloud.
- Cloudflare Inc.: delivery of the website and approximate country detection.
- OpenAI: AI chat and voice transcription.

Some of these providers process data outside Macedonia, including in the United States and the European Union. Where this happens, transfers rely on the safeguards the providers offer, such as the European Commission's Standard Contractual Clauses or the EU-U.S. Data Privacy Framework where a provider is certified. You can ask us for more information about these safeguards at contact@kajak.mk. We do not sell personal data.

## Legal basis
Under Article 10 of the Macedonian Law on Personal Data Protection and, where applicable, Article 6 of Regulation (EU) 2016/679 (GDPR), we process data:
- because it is necessary to provide the marketplace services you request, including registration, profile management and buyer-producer matching;
- on your freely given, explicit consent for showing your telephone number publicly and for optional sharing of contact details;
- on our legitimate interests in platform security and in preventing fraud and abuse, after balancing them against your rights;
- to comply with applicable legal obligations.

You may withdraw consent at any time. This does not affect processing carried out before withdrawal.

## Public telephone numbers
Showing your telephone number is voluntary. Saying No does not prevent you from registering; your number then stays private. A producer's telephone number is shown to matching buyers only if the producer gave explicit consent, the profile is approved, and consent has not been withdrawn. Buyer contact details stay private unless the buyer authorises sharing.

## Retention
- Unfinished registrations are kept for 30 days after the last activity and are then deleted during our regular cleanup.
- Completed registrations are kept while the profile remains active and the information is needed to provide the marketplace. We periodically review inactive profiles and remove information that is no longer needed, unless the law requires us to keep it.
- You can ask for deletion at any time.

## Your rights
You can access your data, withdraw consent, and request correction, deletion, restriction or objection. Where processing is based on consent or on providing the service and is carried out by automated means, you also have the right to data portability: to receive your data in a structured, commonly used, machine-readable format and to have it sent to another controller. Use the form below or email contact@kajak.mk. You can give a telephone number or an email address, so the form also works for unfinished registrations without a telephone number. Before we disclose, change or delete any data, we verify your identity through the telephone number or email address linked to the registration. A conversation key on your device alone is not enough. You have the right to lodge a complaint with the Personal Data Protection Agency of Macedonia (https://azlp.mk).`,
    formTitle: "Privacy request",
    contactHint: "Give the telephone number or email address you used at registration (at least one).",
    phone: "Telephone used at registration (+389…)",
    email: "Email address",
    portability: "Get a copy of my data (portability)",
    withdraw: "Withdraw public telephone consent",
    correction: "Correct my information",
    deletion: "Delete my information",
    details: "Details (optional)",
    submit: "Send request",
    ok: "Request received. We will contact you to verify your identity.",
    fail: "Could not send. Check the phone number and try again.",
  } },
  terms: { version: "2026-11-4", text: {
    title: "Terms of Use",
    banner: "Draft pending legal review. The English text is the original.",
    body: `Operator: **DTU KAJAK AGENCIJA DOOEL SKOPJE**, Emil Zola 7/1/1-40, Skopje – Centar, Macedonia. EMBS: 7555431. EDB: MK4080021602548. Contact: contact@kajak.mk.

## The service
KAJAK.MARKET is an open marketplace that introduces individuals, farmers, livestock farmers, producers and businesses to buyers. Registration as a private individual is allowed; no company registration is required. We are not a party to any sale, do not handle payments or goods, and do not guarantee quality, quantity, price or delivery.

## Your information
You must provide accurate information and only register products you are entitled to sell. We may review, approve or deactivate profiles.

## Acceptable use
Do not collect other users' contact details in bulk, send spam, or attempt to misuse the assistant or the platform.

## AI assistant
The assistant may make mistakes. Your information is saved automatically during the chat and processed by AI services as described in the Privacy Policy; check the summary and tell the assistant about any correction at any time.

## Liability and law
KAJAK.MARKET introduces buyers and producers to each other. We are not a party to any deal between users and accept no liability for the quality, quantity, price, delivery or outcome of a transaction, or for any loss arising from contact between users. This limitation applies only as far as the law of Macedonia allows; nothing in these Terms excludes liability that cannot lawfully be excluded.

Governing law: the law of Macedonia. Competent court: the court of first instance at the seat of DTU KAJAK AGENCIJA DOOEL SKOPJE in Skopje, Macedonia.`,
  } },
  consent: { version: "2026-11-4", text: {
    notice: "What you share here is saved automatically as you go and stored by KAJAK.MARKET to connect buyers and producers, as described in our",
    phonePublic: "I agree that my telephone number may be shown publicly on KAJAK.MARKET to interested buyers who match my products.",
    contactAck: "I understand that interested buyers may contact me directly by telephone.",
    buyerShare: "I authorise KAJAK.MARKET to share my contact details with matching producers.",
    phonePublicNo: "I do not agree to my telephone number being shown publicly. It stays private.",
    contactAckNo: "I do not want interested buyers to contact me directly by telephone.",
    buyerShareNo: "I do not authorise KAJAK.MARKET to share my contact details with producers.",
    yes: "Yes",
    no: "No",
    confirm: "Continue",
  } },
} as const;
export type LegalDoc = keyof typeof LEGAL;

// Flip a document to true once its legal review is confirmed. The public draft banner is then
// hidden in every language; the English source text, translations, versions and consent records
// stay untouched. Internal review status stays visible in the administrator dashboard.
export const LEGAL_REVIEWED: Record<LegalDoc, boolean> = { privacy: true, terms: true, consent: false };

// Visitors see the draft banner only while a document is pending legal review.
export function publicBanner(doc: LegalDoc, texts: { banner?: string }): string | undefined {
  return LEGAL_REVIEWED[doc] ? undefined : texts.banner;
}
