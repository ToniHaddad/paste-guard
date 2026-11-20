/*
 * SYNTHETIC benchmark notes. Every person, number and case is invented.
 * Northbridge Relief is a fictional NGO. Phone numbers use plausible shapes
 * but are made up; email addresses use example domains; IBANs are the public
 * documentation examples; case numbers use the fictional format in detect.js.
 *
 * Markup: {P|text} person, {T|..} phone, {E|..} email, {B|..} IBAN,
 *         {D|..} date of birth, {I|..} ID or passport number, {C|..} case no.
 *
 * Notes 1-10 of each language are the DEV set (used while building the
 * detector). Notes 11-15 are HELD OUT: scored before tuning (see README for
 * the few generic fixes made after). Notes 16-20 are STRESS: informal, few
 * cues, uncommon names; written after tuning finished and never tuned on.
 */
const SRC = {
  en: [
    'Case visit, 3 March. Mrs {P|Hanan Saab} ({C|NBR-LB-2024-004817}) reported that her husband, {P|Elias}, lost his job in January. Phone: {T|+961 71 123 456}. We agreed on a cash assistance review next week.',
    'Complaint received by phone from Mr. {P|Joseph Karam} about delayed vouchers. He says his household ({C|HH-LB-20417}) has waited six weeks. Call back on {T|03 456 789}. Please summarise this for the area manager without the personal details.',
    '{P|Wanjiru Kamau}, born {D|14/05/1991}, came to the Kakuma helpdesk with her three children. Her ID number is {I|27384561}. She asked about the nutrition programme. Email: {E|wanjiru.kamau@example.org}',
    'Interview with Ms {P|Carolina Restrepo} in Soacha. Her son {P|Duván} (aged 9) has been out of school since October. Referred to the education partner. Mobile {T|310 555 0142}. Passport {I|AB1234567}.',
    'Follow-up: the {P|Abdallah} family were relocated to Zahle. The father, {P|Mustafa Abdallah}, confirmed his new number: {T|76 987 654}. Registration {C|NBR-LB-2023-001209} should be updated.',
    'Safeguarding concern raised by Dr {P|Peter Otieno} about a minor, {P|Achieng Odhiambo}, 15. The mother can be reached at {T|0712 345 678}. Do not share outside the protection team.',
    'Notes from home visit: {P|Rima Haddad}, 42, lives with her mother-in-law in Tripoli. IBAN for the transfer: {B|LB62 0999 0000 0001 0019 0122 9114}. DOB: {D|2 August 1982}.',
    'Verification visit. Neighbour {P|Abdelkader Zein} vouched for the applicant, {P|Fatima Mourad}, who has no documents. Her cousin {P|Nayla} will bring the UNHCR number {I|123-24C01234} next week.',
    "Please rewrite this politely: 'Dear Mr {P|Kiprono}, your registration {C|NBR-KE-2024-002731} is approved. Collect your voucher at the Eldoret office. Contact us on {T|+254 722 000 111}.'",
    'Beneficiary {P|Zeinab Ahmad} (DOB {D|12/12/1975}) reports harassment by a landlord named {P|Mahmoud Hamdan}. She gave her email {E|zeinab.ahmad@example.com} and asked us not to call her husband.',
    // held out
    'Call log 14:20. Caller: {P|Samuel Mwangi}, Mombasa, asked why his ward {P|Baraka} was removed from the list. His national ID is {I|23456789} and he can be reached on {T|0733 222 111}. Case {C|HH-KE-33012}.',
    "Mother of the child, {P|Yesenia Cárdenas}, travelled from Cúcuta without her husband. She gave her cédula as {I|1.098.765.432} and phone {T|+57 300 123 4567}. The child's father is {P|Wilmer}.",
    "Meeting with Imam {P|Khaled Itani} and Ms {P|Dalia Sabra} about the shelter rota. {P|Khaled}'s number is {T|70 123 987}.",
    '{P|Ruth Njeri} came to the clinic with a referral; her date of birth is {D|3 June 1999}. Email {E|ruth.njeri@example.co.ke}. Her sister {P|Grace Wambui} also registered under {C|NBR-KE-2024-009915}.',
    'The Sarkissian household in Bourj Hammoud needs a follow-up. Mr {P|Vartan Sarkissian} (ID {I|000123456789}) is hard of hearing, so call his daughter {P|Lara} on {T|01 234 567}.',
    // stress: written after tuning had finished, informal field-note style, uncommon names, few cues
    'Spoke to {P|Ibtisam} this morning. Her husband {P|Hrant} lost his shop in the fire and the landlord, {P|Abou Nader}, wants rent in dollars. Please pass this to {P|Gaelle} in protection. {P|Ibtisam} can be reached on {T|03 888 217}.',
    '{P|Mercy Kerubo}, 29, registered yesterday ({C|NBR-KE-2025-004410}). She is staying with {P|Dennis Ochola} in Kibera. DOB {D|11/11/1996}. {P|Dennis} said he can host her until April.',
    'Visited the {P|Ramirez} family, Calle 5, Soacha. Ms {P|Yurani Ramirez} was not home; her mother {P|Gilma} gave us {T|315 220 9981}. They need the form signed by Friday.',
    '{P|Afif Daoud} rang from Zahle. Says the clinic turned his daughter away. Email {E|afif.daoud@example.org}. ID {I|4455667788} on file.',
    'Handover note: please ask {P|Rawan} or {P|Tamer} to call the {P|Mikati} household. Their cousin, {P|Nasri}, is the contact. {P|Rawan}: {T|76 445 120}.',
  ],
  fr: [
    'Visite à domicile du 12 mars. Madame {P|Hanane Khoury}, née le {D|04/09/1980}, vit avec ses deux enfants à Saïda. Son numéro : {T|03 765 432}. Dossier {C|NBR-LB-2024-005541}. Elle demande un report du loyer.',
    "Plainte de M. {P|Jean-Claude Nasr} concernant la distribution de bons alimentaires. Son téléphone : {T|+961 76 555 019}. Il affirme que son épouse, {P|Nada}, n'a pas été enregistrée. La visite sera faite par {P|Nawfal} la semaine prochaine.",
    'Entretien avec Mme {P|Aïcha Benali} (passeport {I|RL4567812}) au centre de Tripoli. Sa fille {P|Inès} a besoin d’un suivi médical. Courriel : {E|aicha.benali@example.org}.',
    'Le père, {P|Georges Haddad}, fils de {P|Michel}, a signalé un conflit avec le propriétaire. Il est joignable au {T|71 234 567}. IBAN pour le remboursement : {B|FR14 2004 1010 0505 0001 3M02 606}.',
    'Résumé : la famille {P|Mansour} a été déplacée vers Zahlé. {P|Mariam Mansour}, veuve de {P|Samir}, demande une aide en espèces. N° de dossier {C|HH-LB-18820}. Sa sœur {P|Taline} l’accompagne.',
    'Dr {P|Pascal Rizk} a orienté le patient {P|Tarek Hammoud} vers le programme de santé mentale. Né le {D|7 juillet 1990}. Contact : {E|tarek.hammoud@example.com}.',
    "Rapport de terrain : Mme {P|Odette Karam} a refusé l'aide. Sa voisine, {P|Rola}, confirme qu'elle ne peut pas signer. Téléphone de {P|Rola} : {T|03 111 222}.",
    "La bénéficiaire {P|Salwa Tabet} (carte d'identité n° {I|034567891234}) a perdu son enregistrement {C|NBR-LB-2022-003310}. Merci de résumer sa demande sans citer ses données.",
    "M. {P|Kevin Mukendi}, né en {D|1987}, est arrivé de Kinshasa. Son numéro : {T|+243 81 234 5678}. Il cherche un hébergement pour sa femme {P|Espérance} et leurs trois enfants.",
    "Appel de Mademoiselle {P|Léa Sfeir}, 24 ans, au sujet de ses frais de transport. Elle habite à Jounieh. Elle a donné le {T|70 998 877} et son email {E|lea.sfeir@example.org}.",
    // held out
    "Madame {P|Rachelle Eid} et son mari {P|Antoine} ont déposé une demande d'abri. Numéro de dossier {C|NBR-LB-2024-007002}. Tél. : {T|76 321 654}.",
    "Entretien : l'enfant {P|Maryam}, 8 ans, fille de {P|Bassam Chamoun}, ne va plus à l'école. Le père a donné son passeport : {I|LR2345678}. Joignable au {T|+961 3 456 789}. La tante, {P|Zakia}, garde les enfants.",
    "Le docteur {P|Samia Boutros} demande que le dossier de Mme {P|Yvonne Gerges} soit transféré. Le dossier a été ouvert par {P|Liliane Aoun}. Elle est née le {D|21 janvier 1965}. Mail : {E|y.gerges@example.org}.",
    "Plainte contre un agent : Monsieur {P|Ghassan Ouaida} affirme qu'on lui a demandé de l'argent. Il a appelé depuis le {T|71 000 345}. Dossier {C|HH-LB-27733}.",
    "La veuve, {P|Souad}, vit seule à Baalbeck avec son fils {P|Karim}, 12 ans. Registre civil n° {I|2345678}. Visite prévue lundi avec {P|Hrayr} de l'équipe.",
    // stress
    'Mme {P|Tamar Kasparian} est venue avec sa m\u00E8re. Elles ont perdu leurs papiers \u00E0 Bourj Hammoud. Contact : {P|Hagop}, {T|71 556 903}. Dossier {C|NBR-LB-2025-001188}.',
    "Hier, {P|Wassim} a appel\u00E9 la hotline. Sa belle-s\u0153ur {P|Dima} est enceinte et n'a pas de suivi. Il ne veut pas donner son nom de famille. Num\u00E9ro : {T|03 220 114}.",
    "Entretien avec {P|Joumana}. Son mari, {P|Raymond Abi Raad}, est en d\u00E9tention depuis mars. Elle craint pour ses trois enfants. {P|Jean-Marc}, le voisin, peut garder les enfants.",
    "La famille de {P|Manuel Ospina} a quitt\u00E9 Arauca. {P|Manuel} parle espagnol et un peu d'anglais. T\u00E9l\u00E9phone WhatsApp : {T|+57 321 700 4455}. N\u00E9 le {D|2 f\u00E9vrier 1978}.",
    "Dossier transf\u00E9r\u00E9 \u00E0 {P|Bertille}, notre coll\u00E8gue de Tyr. La b\u00E9n\u00E9ficiaire, {P|Oumou Sangar\u00E9}, n'a pas de papiers. IBAN : {B|FR14 2004 1010 0505 0001 3M02 606}.",
  ],
  ar: [
    'زيارة منزلية بتاريخ ١٢ آذار. السيدة {P|حنان صعب} (رقم الملف {C|NBR-LB-2024-004817}) أبلغت أن زوجها {P|إلياس} فقد عمله. رقم الهاتف: {T|٠٣ ١٢٣ ٤٥٦}. تحتاج إلى مساعدة نقدية.',
    'اتصل السيد {P|محمد الحاج} بخصوص تأخر القسائم الغذائية. يقيم في طرابلس ورقم هاتفه {T|+961 76 555 019}. ذكر أن ابنه {P|يوسف} مريض.',
    'المستفيدة {P|زينب حمدان}، من مواليد {D|04/09/1980}، تسكن مع والدتها في صيدا. رقم الهوية {I|٠٣٤٥٦٧٨٩١٢٣٤}. البريد: {E|zeinab.hamdan@example.org}',
    'بلغ الأستاذ {P|جورج نصار} عن خلاف مع مالك المنزل. زوجته {P|ندى} لا تملك أوراقاً ثبوتية. للتواصل: {T|71 234 567}.',
    'الأسرة: {P|أبو خالد} ({P|فادي عيسى}) وأفراد الأسرة انتقلوا إلى زحلة. رقم الأسرة {C|HH-LB-18820}. رقم حسابه IBAN: {B|LB62 0999 0000 0001 0019 0122 9114}.',
    'تقرير ميداني: السيدة {P|ماريا الخوري} رفضت المساعدة. جارتها {P|رولا} شهدت أنها لا تستطيع التوقيع. هاتف {P|رولا} {T|٠٣ ١١١ ٢٢٢}.',
    'المريض {P|طارق همود} (مولود في {D|7 تموز 1990}) أُحيل إلى برنامج الصحة النفسية. ابنته {P|ميرا} تحتاج إلى متابعة.',
    'قدمت السيدة {P|آمنة محمود} شكوى ضد موظف طلب منها مبلغاً مالياً. جواز سفرها رقم {I|RL4567812} وجوالها {T|70 998 877}.',
    'طلب الشيخ {P|عبد الرحمن سلوم} نقل ملف ابنة أخيه {P|نادين} إلى مكتب البقاع. رقم القيد {I|2345678}. الملف {C|NBR-LB-2022-003310}.',
    'المواطن {P|حسين عبد الله}، من مواليد {D|1987}، وصل من حلب مع زوجته {P|هدى} وأطفالهما الثلاثة. هاتفه {T|0096170123987}.',
    // held out
    'اتصلت الآنسة {P|لارا شهاب} لتسأل عن موعد التوزيع. تسكن في الدكوانة. بريدها {E|lara.chehab@example.com} ورقم ملفها {C|NBR-LB-2024-007002}.',
    'أخبرنا {P|أبو علي} بأن ابنه {P|بلال} ترك المدرسة. العائلة من آل {P|الصباغ} وتقيم في مخيم برج البراجنة. الهاتف {T|٧٦٣٢١٦٥٤}.',
    'الدكتورة {P|سميرة قاسم} طلبت تحويل ملف السيدة {P|إيفون جرجس}. تاريخ الميلاد: {D|٢١/٠١/١٩٦٥}. رقم الهوية {I|123456789012}.',
    'شكوى ضد موظف: قال السيد {P|غسان عويدة} إنه طُلب منه مال. اتصل من الرقم {T|71 000 345}. رقم الأسرة {C|HH-LB-27733}.',
    'الأرملة {P|سعاد} تعيش وحدها في بعلبك مع ابنها {P|كريم} (١٢ سنة). الجارة {P|أم جميل} ساعدتها في التسجيل.',
    // stress
    'تواصلت مع {P|تيماء} الليلة الماضية. زوجها {P|حافظ} فقد عمله في الحريق. اتصلت بالرقم {T|٠٣ ٨٨٨ ٢١٧} ولم تجب.',
    'المستفيد: {P|عماد الدين شرارة}، من مواليد {D|١٩٧٤}. رقم الملف {C|NBR-LB-2025-002257}. يسكن في عكار مع شقيقه {P|نبيل}.',
    'قالت {P|أم كنان} إن المدرسة طلبت أوراقاً. حاولنا الاتصال بالمختار {P|وليد حبيب} فلم يرد. للاتصال: {T|+961 71 330 984}.',
    'ابنة السيدة {P|نجلاء قصّار}، {P|لينا}، حامل وتحتاج إلى فحص. بريد الأسرة: {E|qassar.family@example.org}. هوية رقم {I|١٢٣٤٥٦٧٨٩}.',
    'تم تحويل ملف {P|إيناس} إلى المكتب. والدها، السيد {P|غابي الأشقر}، يطلب موعداً. الرقم: {T|٧٠ ٥٥٥ ٠١٢}.',
  ],
};

const TYPE_OF = { P: 'PERSON', T: 'PHONE', E: 'EMAIL', B: 'IBAN', D: 'DOB', I: 'ID', C: 'CASE' };

function build() {
  const notes = [];
  for (const lang of Object.keys(SRC)) {
    SRC[lang].forEach((src, i) => {
      let text = '';
      const entities = [];
      const re = /\{([PTEBDIC])\|([^}]*)\}/g;
      let last = 0, m;
      while ((m = re.exec(src))) {
        text += src.slice(last, m.index);
        const start = text.length;
        text += m[2];
        entities.push({ start, end: text.length, type: TYPE_OF[m[1]], text: m[2] });
        last = re.lastIndex;
      }
      text += src.slice(last);
      notes.push({ id: `${lang}-${String(i + 1).padStart(2, '0')}`, lang, split: i < 10 ? 'dev' : i < 15 ? 'heldout' : 'stress', text, entities });
    });
  }
  return notes;
}

module.exports = { build };
