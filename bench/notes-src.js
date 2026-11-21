/*
 * SYNTHETIC benchmark notes. Every person, number and case is invented. The
 * setting is one humanitarian organization in Lebanon ("the Organization");
 * places are real Lebanese geography, nothing else is real. Phone numbers have
 * plausible shapes but are made up; emails use example domains; IBANs have the
 * Lebanese shape but are invented; case numbers use the fictional format in
 * detect.js.
 *
 * Five kinds of note, four of each per language:
 *   1 social worker's case note from a centre
 *   2 complaint received on the hotline
 *   3 note from a shelter in a school during an emergency
 *   4 message to a warehouse about a delivery to a named family
 *   5 rent assistance follow-up with a landlord's name and IBAN
 *
 * Markup: {P|text} person, {T|..} phone, {E|..} email, {B|..} IBAN,
 *         {D|..} date of birth, {I|..} ID or passport number, {C|..} case no.
 *
 * Splits, per language: notes 1-10 DEV (the only ones used for tuning),
 * 11-15 HELD OUT, 16-20 STRESS (informal, few cues, uncommon names).
 * Held-out and stress notes were written and labelled before any detection
 * code was changed for this setting, and are not tuned on.
 */
const SRC = {
  en: [
    // ---- dev ----
    'Home visit, Saida centre, 12 March. Mrs {P|Hanan Saab} (file {C|CS-2026-004817}) came with her mother. Her husband, {P|Elias}, lost his job in January and the family now pays rent from savings. Phone {T|+961 71 123 456}. DOB {D|02/08/1982}. Referred to the cash assistance team; follow up in two weeks.',
    'Hotline call {C|HL-2026-000312}, received 09:40. Caller: Mr {P|Joseph Karam}, from Jbeil, says the food voucher promised to his household has not arrived after six weeks. He can be called back on {T|03 456 789}. Please summarise for the area manager without personal details.',
    'Shelter note, school in Zahle, night of 14 October. 38 families registered, 11 new arrivals. The {P|Haddad} family (6 people, head of family {P|Georges Haddad}) needs two mattresses and baby milk. Caretaker {P|Abou Elias} will open the storage room at 7. Duty phone on site: {T|76 987 654}.',
    'To the WH-07 keeper: please prepare 2 hygiene kits and 1 food box (project FA-2026) for the family of {P|Mohammad Kassem}, Tripoli. The driver, {P|Ali}, will collect on Friday morning. The recipient’s phone is {T|70 998 877}. Waybill DSP-2026-00412.',
    'Rent assistance follow-up. Landlord Mr {P|Antoine Frem} confirmed that the contract for the {P|Mansour} family’s apartment in Baalbek runs to June. Payment of 3,600 USD to IBAN {B|LB30 0999 0000 0001 0045 2210 7731}. Tenant phone {T|+961 76 555 019}.',
    'Centre note, Tripoli. {P|Zeinab Ahmad}, 34, widow, three children. Her ID number is {I|000123456789}. She reported pressure from the landlord, {P|Mahmoud Hamdan}, to leave by the end of the month. She does not want us to call her brother. Email {E|zeinab.ahmad@example.org}.',
    'Complaint by phone ({C|HL-2026-000341}) from Mrs {P|Hoda Nasser} about a staff member who asked her for money to register her family. She does not want her name shared. Her number is {T|71 234 567}. Escalated to the protection focal point.',
    'School shelter, Halba. The mother of the twins, {P|Maryam}, has a fever; Dr {P|Pascal Rizk} visits tomorrow. Her husband {P|Tarek} went to Beirut to find work and can be reached on {T|+961 3 456 789}. We need blankets for 5 people.',
    'Hi, this is the Jbeil centre. Please dispatch 4 mattresses and 2 food parcels to Madame {P|Souad Eid} and her son {P|Karim} in Byblos before Thursday. She will sign the waybill. Her number: {T|03 111 222}.',
    'Rent follow-up for the Saida family: the landlord, {P|Sleiman Abi Nader}, sent his IBAN {B|LB48 0555 0000 0000 0020 3317 6045}. The tenant is {P|Rima Chehade}, passport {I|RL2233445}. The contract ends on 30 June 2026.',
    // ---- held out ----
    'Visit note, Zahle centre. {P|Dalia Sabra} (born {D|3 June 1989}) lives with her sister {P|Lara} and two nephews. Phone {T|70 123 987}. Registration {C|FAM-2026-01234} is active. She asked about school fees support.',
    'Caller: {P|Bassam Chamoun}, 56, from Jounieh, reports that his delivery was left at the wrong address. Complaint number {C|HL-2026-000388}. Please call back on {T|+961 71 330 984} after 5 pm.',
    'Night report, Saida school shelter. A quarrel between {P|Abou Khaled}’s family and the {P|Zein} family was calmed by Sister {P|Marie}. No injuries. Request: 20 blankets and a lock for the classroom door.',
    'Please prepare a hygiene kit for {P|Yvonne Gerges}, Tyre, to be collected by her cousin {P|Nabil Sfeir} (ID {I|123456789012}). His number is {T|03 765 432}. WH-12, project EA-2026.',
    'The landlord, Hajj {P|Ahmad Itani}, asked for a copy of the transfer to IBAN {B|LB71 0222 0000 0000 0018 8804 3392}. The tenant, {P|Fadia Itani}, is his niece, which we noted as a conflict of interest.',
    // ---- stress ----
    'Met {P|Ghada}’s mother-in-law at the centre. {P|Tamar Kasparian}, 61, speaks only Armenian and Arabic, so her son {P|Hagop} translated. They moved from Bourj Hammoud after the building cracked. {P|Hagop}: {T|71 556 903}. File {C|CS-2026-006077}.',
    'Hotline, afternoon. A man who gave only his first name, {P|Wassim}, said the distribution list in Akkar includes his dead uncle {P|Nawfal}. Ref {C|HL-2026-000402}. His cousin {P|Rawan} is the contact: {T|76 445 120}.',
    'Overnight in the Jbeil school: {P|Mouna} and {P|Tamer}’s children have lice, {P|Joumana} from the clinic brought shampoo. Old Mr {P|Zakhia} refuses to move rooms. Ask {P|Tony} to bring two heaters. {P|Mouna}: {T|03 220 114}.',
    'Hello {P|Charbel}, can you load the cheese boxes for {P|Afif Daoud} in Halba? He is the cousin of Sister {P|Hala}, collects Saturday, has no phone, so use his brother {P|Nasri} on {T|71 000 345}. Waybill DSP-2026-00518.',
    'Landlord is {P|Wadih Abi Raad}, Jounieh, IBAN {B|LB12 0999 0000 0001 0033 5509 8821}. Tenant {P|Fayrouz}, born {D|2 February 1978}, ID {I|4455667788} on file. {P|Wadih} will sign with the new mokhtar, {P|Nicolas}.',
  ],
  fr: [
    // ---- dev ----
    "Visite à domicile, centre de Saïda, 12 mars. Madame {P|Hanane Khoury} (dossier {C|CS-2026-005541}), née le {D|04/09/1980}, vit avec ses deux enfants. Son mari, {P|Georges}, est sans emploi depuis janvier. Joignable au {T|03 765 432}. Orientée vers l’équipe d’aide en espèces.",
    "Appel à la ligne d’assistance {C|HL-2026-000355}. Monsieur {P|Jean-Claude Nasr} se plaint que son bon alimentaire n’est pas arrivé. Il dit que son épouse, {P|Nada}, n’a pas été enregistrée. Rappeler au {T|+961 76 555 019}.",
    "Note de nuit, abri dans l’école de Zahlé. 41 familles. La famille {P|Mansour} (6 personnes) a besoin de matelas. {P|Mariam Mansour}, veuve de {P|Samir}, signale que sa fille a de la fièvre. Le gardien, {P|Abou Joseph}, ouvre le dépôt à 7 h.",
    "Bonjour, merci de préparer au dépôt WH-12 deux kits d’hygiène et un colis alimentaire (projet FA-2026) pour la famille de {P|Tarek Hammoud} à Tripoli. Le chauffeur, {P|Elie}, passera vendredi. Téléphone du bénéficiaire : {T|70 998 877}.",
    "Suivi loyer : le propriétaire, M. {P|Antoine Frem}, a confirmé le contrat de la famille {P|Mansour} à Baalbek jusqu’en juin. Virement de 3 600 USD sur l’IBAN {B|LB30 0999 0000 0001 0045 2210 7731}. Locataire : {T|03 456 789}.",
    "Note de centre, Tripoli. Mme {P|Aïcha Benali}, 34 ans, veuve, trois enfants. Passeport {I|RL4408123}. Elle dit subir des pressions de son propriétaire, {P|Mahmoud Hamdan}. Elle ne veut pas que nous appelions son frère. Courriel : {E|aicha.benali@example.org}.",
    "Plainte reçue par téléphone ({C|HL-2026-000361}) de Mme {P|Hoda Nasser} : un agent lui aurait demandé de l’argent. Elle demande l’anonymat. Numéro : {T|71 234 567}. Transmis au point focal protection.",
    "Abri, école de Halba. {P|Maryam}, mère des jumeaux, a de la fièvre ; le docteur {P|Pascal Rizk} passe demain. Son mari, {P|Tarek}, travaille à Beyrouth : {T|03 111 222}. Besoin de 5 couvertures.",
    "Merci d’expédier 4 matelas et 2 colis à Madame {P|Souad Eid} et son fils {P|Karim}, à Jbeil, avant jeudi. Elle signera le bordereau. Son numéro : {T|76 321 654}. Bordereau DSP-2026-00431.",
    "Loyer : propriétaire {P|Sleiman Abi Nader}, IBAN {B|LB48 0555 0000 0000 0020 3317 6045}. Locataire {P|Rima Chehade}, carte d’identité n° {I|034567891234}. Le contrat se termine le 30 juin 2026.",
    // ---- held out ----
    "Visite, centre de Zahlé. {P|Dalia Sabra}, née le {D|3 juin 1989}, vit avec sa sœur {P|Lara}. Tél. {T|70 123 987}. Dossier {C|FAM-2026-01234} actif. Elle demande une aide pour les frais de scolarité.",
    "Appelant : {P|Bassam Chamoun}, 56 ans, de Jounieh. Sa livraison a été déposée à la mauvaise adresse. Réf. {C|HL-2026-000388}. Rappeler au {T|+961 71 330 984} après 17 h.",
    "Rapport de nuit, abri de l’école de Saïda. Dispute entre la famille de {P|Abou Khaled} et la famille {P|Zein}, calmée par sœur {P|Marie}. Pas de blessés. Besoin de 20 couvertures.",
    "Merci de préparer un kit d’hygiène pour {P|Yvonne Gerges}, à Tyr, retrait par son cousin {P|Nabil Sfeir} (carte {I|123456789012}). Son numéro : {T|03 765 432}. WH-12, projet EA-2026.",
    "Le propriétaire, Hajj {P|Ahmad Itani}, demande la copie du virement vers l’IBAN {B|LB71 0222 0000 0000 0018 8804 3392}. La locataire, {P|Fadia Itani}, est sa nièce : conflit d’intérêts noté.",
    // ---- stress ----
    "Entretien avec {P|Joumana}. Son mari, {P|Raymond Abi Raad}, est détenu depuis mars. Elle craint pour ses enfants. {P|Jean-Marc}, le voisin, peut les garder. Elle a perdu son passeport ; dossier {C|CS-2026-006102}.",
    "Appel de la ligne : {P|Wassim} a dit que sa belle-sœur {P|Dima} est enceinte et sans suivi. Il refuse de donner son nom de famille. Rappeler {P|Dima} au {T|03 220 114}. Réf. {C|HL-2026-000419}.",
    "Abri de Jbeil, nuit : les enfants de {P|Mouna} ont des poux. {P|Taline}, de la clinique, a apporté du shampoing. Dites à {P|Bertille} de venir avec deux radiateurs. {P|Mouna} : {T|71 556 903}.",
    "Salut {P|Charbel}, peux-tu charger les cartons de fromage pour {P|Zakaria} à Halba ? Il retire samedi, pas de téléphone, appeler son frère {P|Hrayr} au {T|76 445 120}. Bordereau DSP-2026-00577.",
    "Propriétaire : {P|Wadih Abi Raad}, Jounieh, IBAN {B|LB12 0999 0000 0001 0033 5509 8821}. Locataire {P|Fayrouz}, née le {D|2 février 1978}. {P|Wadih} signera avec le moukhtar, {P|Nicolas}.",
  ],
  ar: [
    // ---- dev ----
    'زيارة منزلية، مركز صيدا، ١٢ آذار. السيدة {P|حنان صعب} (ملف {C|CS-2026-004817}) حضرت مع والدتها. زوجها {P|إلياس} فقد عمله في كانون الثاني. هاتفها {T|٠٣ ١٢٣ ٤٥٦}. تاريخ الميلاد {D|٠٢/٠٨/١٩٨٢}. أُحيلت إلى فريق المساعدة النقدية.',
    'اتصال على الخط الساخن {C|HL-2026-000312}. المتصل السيد {P|محمد الحاج} من جبيل يقول إن القسيمة الغذائية لم تصل منذ ستة أسابيع. للاتصال به {T|+961 76 555 019}. يرجى تلخيص الشكوى لمدير المنطقة دون بيانات شخصية.',
    'ملاحظة الملجأ، مدرسة زحلة، ليلة ١٤ تشرين الأول. ٣٨ عائلة. عائلة {P|حداد} (٦ أشخاص) تحتاج إلى فرشتين. {P|أبو إلياس} حارس المدرسة سيفتح المستودع الساعة السابعة. رقم المناوب {T|٧٦ ٩٨٧ ٦٥٤}.',
    'إلى أمين مستودع WH-07: يرجى تجهيز حقيبتي نظافة وطرد غذائي (مشروع FA-2026) لعائلة {P|محمد قاسم} في طرابلس. السائق {P|علي} سيستلم صباح الجمعة. هاتف المستفيد {T|70 998 877}. بوليصة DSP-2026-00412.',
    'متابعة بدل الإيجار: المالك السيد {P|أنطوان فرم} أكد عقد عائلة {P|منصور} في بعلبك حتى حزيران. المبلغ ٣٬٦٠٠ دولار إلى الحساب {B|LB30 0999 0000 0001 0045 2210 7731}. هاتف المستأجر {T|+961 76 555 019}.',
    'ملاحظة مركز طرابلس. {P|زينب أحمد}، ٣٤ سنة، أرملة ولديها ثلاثة أطفال. رقم الهوية {I|٠٠٠١٢٣٤٥٦٧٨٩}. تشكو من ضغط المالك {P|محمود حمدان} لإخلاء المنزل. لا تريد أن نتصل بأخيها. البريد {E|zeinab.ahmad@example.org}.',
    'شكوى هاتفية ({C|HL-2026-000341}) من السيدة {P|هدى ناصر} عن موظف طلب منها مالاً لتسجيل عائلتها. تطلب عدم ذكر اسمها. رقمها {T|71 234 567}. أُحيلت إلى منسق الحماية.',
    'ملجأ مدرسة حلبا. {P|مريم} أم التوأم مصابة بالحمى والطبيب {P|باسكال رزق} سيزورها غداً. زوجها {P|طارق} سافر إلى بيروت للعمل ورقمه {T|٠٣ ٤٥٦ ٧٨٩}. نحتاج خمس بطانيات.',
    'مرحباً، من مركز جبيل: يرجى إرسال ٤ فرشات وطردين غذائيين إلى السيدة {P|سعاد عيد} وابنها {P|كريم} قبل الخميس. ستوقّع على البوليصة. رقمها {T|03 111 222}.',
    'متابعة الإيجار: المالك {P|سليمان أبي نادر}، رقم الحساب {B|LB48 0555 0000 0000 0020 3317 6045}. المستأجرة {P|ريما شحادة} جواز سفرها {I|RL2233445}. العقد ينتهي في ٣٠ حزيران ٢٠٢٦.',
    // ---- held out ----
    'زيارة مركز زحلة. {P|داليا صبرا}، مولودة في {D|٣ حزيران ١٩٨٩}، تسكن مع أختها {P|لارا} وولديها. هاتفها {T|70 123 987}. تسجيل العائلة {C|FAM-2026-01234} فعّال. تسأل عن دعم الأقساط المدرسية.',
    'المتصل: {P|بسام شمعون}، ٥٦ سنة، من جونيه. أُوصل طرده إلى عنوان خاطئ. رقم الشكوى {C|HL-2026-000388}. الاتصال على {T|+961 71 330 984} بعد الخامسة.',
    'تقرير الليل، ملجأ مدرسة صيدا. خلاف بين عائلة {P|أبو خالد} وعائلة {P|زين} هدّأته الأخت {P|ماري}. لا إصابات. المطلوب ٢٠ بطانية.',
    'يرجى تجهيز حقيبة نظافة للسيدة {P|إيفون جرجس} في صور ليستلمها ابن عمها {P|نبيل صفير} (هوية {I|123456789012}). رقمه {T|03 765 432}. مستودع WH-12، مشروع EA-2026.',
    'المالك الحاج {P|أحمد إيتاني} يطلب نسخة عن التحويل إلى {B|LB71 0222 0000 0000 0018 8804 3392}. المستأجرة {P|فادية إيتاني} ابنة أخيه، وقد سجلنا تضارب مصالح.',
    // ---- stress ----
    'تواصلت مع حماة {P|غادة} في المركز. {P|تمار قصباريان}، ٦١ سنة، تتكلم الأرمنية والعربية فقط فترجم ابنها {P|هاكوب}. انتقلوا من برج حمود بعد تشقق المبنى. هاتف {P|هاكوب} {T|٧١ ٥٥٦ ٩٠٣}. ملف {C|CS-2026-006077}.',
    'الخط الساخن بعد الظهر: رجل ذكر اسمه الأول فقط، {P|وسيم}، قال إن لائحة التوزيع في عكار تضم عمه المتوفى {P|نوفل}. مرجع {C|HL-2026-000402}. ابنة عمه {P|روان} هي جهة الاتصال: {T|76 445 120}.',
    'ليلة في مدرسة جبيل: أولاد {P|منى} و{P|تامر} أصيبوا بالقمل وجاءت {P|جومانة} من العيادة بالشامبو. العم {P|زخيا} يرفض تغيير الغرفة. اطلبوا من {P|طوني} تأمين مدفأتين. {P|منى}: {T|03 220 114}.',
    'مرحباً {P|شربل}، هل تحمّل علب الجبن لـ{P|عفيف داود} في حلبا؟ هو ابن خال الأخت {P|هالة}، يستلم السبت وليس لديه هاتف، اتصلوا بأخيه {P|نصري} على {T|71 000 345}. بوليصة DSP-2026-00518.',
    'المالك {P|وديع أبي رعد} في جونيه، الحساب {B|LB12 0999 0000 0001 0033 5509 8821}. المستأجرة {P|فيروز}، من مواليد {D|٢ شباط ١٩٧٨}، هويتها رقم {I|٤٤٥٥٦٦٧٧٨٨} في الملف. {P|وديع} سيوقّع مع المختار {P|نقولا}.',
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
