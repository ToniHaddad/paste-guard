'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { detect, normDigits } = require('../src/detect.js');

const has = (text, type, value, opts) => {
  const f = detect(text, opts).filter((s) => s.type === type).map((s) => s.text);
  assert.ok(f.includes(value), `expected ${type} "${value}" in ${JSON.stringify(f)} for: ${text}`);
};
const lacks = (text, type, opts) => {
  const f = detect(text, opts).filter((s) => s.type === type);
  assert.equal(f.length, 0, `unexpected ${type}: ${JSON.stringify(f.map((s) => s.text))} in: ${text}`);
};

test('phones: Lebanese mobile, landline and international', () => {
  has('call 03 456 789 today', 'PHONE', '03 456 789');
  has('call 71 234 567 today', 'PHONE', '71 234 567');
  has('call 81 234 567 today', 'PHONE', '81 234 567');
  has('landline 01 234 567', 'PHONE', '01 234 567');
  has('landline 08 345 678', 'PHONE', '08 345 678');
  has('on +961 76 555 019.', 'PHONE', '+961 76 555 019');
  has('on +961 3 456 789 ok', 'PHONE', '+961 3 456 789');
  has('on 0096170123987 ok', 'PHONE', '0096170123987');
  has('his brother abroad: +33 6 12 34 56 78', 'PHONE', '+33 6 12 34 56 78');
  has('relative in Dubai +971 50 123 4567', 'PHONE', '+971 50 123 4567');
});

test('phones: Arabic-Indic digits, offsets preserved', () => {
  const t = 'رقم الهاتف: ٠٣ ١٢٣ ٤٥٦ شكرا';
  const s = detect(t).find((x) => x.type === 'PHONE');
  assert.equal(s.text, '٠٣ ١٢٣ ٤٥٦');
  assert.equal(t.slice(s.start, s.end), s.text);
  assert.equal(normDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
});

test('same phone in two formats gets the same key', () => {
  const a = detect('+961 71 123 456')[0];
  const b = detect('٠٧١ ١٢٣ ٤٥٦')[0];
  assert.equal(a.key, b.key);
});

test('numbers that are not phones are left alone', () => {
  lacks('The household has 3 adults, 4 children and received 120 USD in 2026.', 'PHONE');
  lacks('Visited on 03-12-2026 and again 12/03/2026.', 'PHONE');
  lacks('Weight 12.5 kg, height 140 cm, age 34.', 'PHONE');
  lacks('Rent 3,600 USD for 12 months.', 'PHONE');
  lacks('Waybill DSP-2026-00412 for WH-07, receipt RCV-2026-00001.', 'PHONE');
});

test('email and IBAN', () => {
  has('write to a.b-c@example.org please', 'EMAIL', 'a.b-c@example.org');
  has('IBAN LB62 0999 0000 0001 0019 0122 9114 for transfer', 'IBAN', 'LB62 0999 0000 0001 0019 0122 9114');
  has('IBAN LB30099900000001004522107731.', 'IBAN', 'LB30099900000001004522107731');
  has('IBAN: LB48 0555 0000 0000 0020 3317 6045 DOB', 'IBAN', 'LB48 0555 0000 0000 0020 3317 6045');
  has('IBAN GB82WEST12345698765432.', 'IBAN', 'GB82WEST12345698765432');
  lacks('code AB12 is the room', 'IBAN');
});

test('case numbers (fictional format)', () => {
  has('file CS-2026-004817 open', 'CASE', 'CS-2026-004817');
  has('hotline ref HL-2026-000312', 'CASE', 'HL-2026-000312');
  has('family FAM-2026-01234 is active', 'CASE', 'FAM-2026-01234');
  has('ملف CS-2026-004817 مفتوح', 'CASE', 'CS-2026-004817');
  lacks('code XYZ-2026-004817', 'CASE');
  lacks('Waybill DSP-2026-00412, receipt RCV-2026-00001, transfer TRF-2026-00007.', 'CASE');
});

test('date of birth only after a cue', () => {
  has('born 14/05/1991 in Saida', 'DOB', '14/05/1991');
  has('DOB: 2 August 1982', 'DOB', '2 August 1982');
  has('née le 7 juillet 1990', 'DOB', '7 juillet 1990');
  has('تاريخ الميلاد: ٢١/٠١/١٩٦٥', 'DOB', '٢١/٠١/١٩٦٥');
  has('من مواليد 1987', 'DOB', '1987');
  has('her date of birth is 3 June 1999', 'DOB', '3 June 1999');
  has('مولود في ٧ تموز ١٩٩٠', 'DOB', '٧ تموز ١٩٩٠');
  lacks('Visit on 14/05/2026, contract ends 30 June 2026.', 'DOB');
  lacks('العقد ينتهي في ٣٠ حزيران ٢٠٢٦', 'DOB');
});

test('ID and passport numbers', () => {
  has('Passport RL4567812.', 'ID', 'RL4567812');
  has('RL4567812 was lost', 'ID', 'RL4567812');
  has('national ID is 23456789 on file', 'ID', '23456789');
  has('carte d’identité n° 034567891234', 'ID', '034567891234');
  has('ID 000123456789', 'ID', '000123456789');
  has('رقم الهوية ٠٣٤٥٦٧٨٩١٢٣٤', 'ID', '٠٣٤٥٦٧٨٩١٢٣٤');
  lacks('ID 12', 'ID');
});

test('person: titles in English, French, Arabic', () => {
  has('Mrs Hanan Saab called', 'PERSON', 'Hanan Saab');
  has('Dr. Pascal Rizk about', 'PERSON', 'Pascal Rizk');
  has('Madame Odile Fontaine est venue', 'PERSON', 'Odile Fontaine');
  has('M. Jean-Claude Nasr a appelé', 'PERSON', 'Jean-Claude Nasr');
  has('Mme Aïcha Benali (passeport', 'PERSON', 'Aïcha Benali');
  has('Hajj Ahmad Itani asked', 'PERSON', 'Hajj Ahmad Itani');
  has('اتصل السيد محمد الحاج بخصوص', 'PERSON', 'محمد الحاج');
  has('الدكتورة سميرة قاسم طلبت', 'PERSON', 'سميرة قاسم');
  has('السيدة إيفون جرجس.', 'PERSON', 'إيفون جرجس');
  has('أبونا إلياس زار الملجأ', 'PERSON', 'إلياس');
});

test('person: relational cues and roles', () => {
  has('the daughter of Hassan Zakaria said', 'PERSON', 'Hassan Zakaria');
  has('Georges Haddad, fils de Michel, a signalé', 'PERSON', 'Michel');
  has('Her son Wilmer is out of school', 'PERSON', 'Wilmer');
  has('the landlord, Ziyad Abdelnour, called', 'PERSON', 'Ziyad Abdelnour');
  has('la tante, Zakia, garde', 'PERSON', 'Zakia');
  has('le propriétaire Wadih Khalife', 'PERSON', 'Wadih Khalife');
  has('زوجها إلياس فقد عمله', 'PERSON', 'إلياس');
  has('جارتها رولا شهدت', 'PERSON', 'رولا');
  has('المالك رياض الخوري في جبيل', 'PERSON', 'رياض الخوري');
  has('السائق علي في الطريق', 'PERSON', 'علي');
});

test('person: Arabic particles and compound names', () => {
  has('Abdel Nasser Zein arrived', 'PERSON', 'Abdel Nasser Zein');
  has('met Abd el Kader at noon', 'PERSON', 'Abd el Kader');
  has('Abdul Rahman called', 'PERSON', 'Abdul Rahman');
  has('Abou Elias came', 'PERSON', 'Abou Elias');
  has('Bou Khalil said so', 'PERSON', 'Bou Khalil');
  has('Umm Ali brought bread', 'PERSON', 'Umm Ali');
  has('spoke with Al-Masri yesterday', 'PERSON', 'Al-Masri');
  has('Mr El Hajj arrived', 'PERSON', 'El Hajj');
  has('Jean-Pierre Abou Jaoude spoke', 'PERSON', 'Jean-Pierre Abou Jaoude');
  has('Abi Nader owns the building', 'PERSON', 'Abi Nader');
  has('حضر عبد الله الصباغ', 'PERSON', 'عبد الله الصباغ');
  has('عبد الرحمن زين وصل', 'PERSON', 'عبد الرحمن زين');
  has('كلمت أبو خالد اليوم', 'PERSON', 'أبو خالد');
  has('قابلت بو خليل', 'PERSON', 'بو خليل');
  has('عائلة أبي نادر', 'PERSON', 'أبي نادر');
  has('محمد بن سلمان', 'PERSON', 'محمد بن سلمان');
  has('مع أم علي', 'PERSON', 'أم علي');
});

test('person: gazetteer, growth to an unknown surname, possessive', () => {
  has('Zeinab Ahmad reports harassment', 'PERSON', 'Zeinab Ahmad');
  has('She met Rima Zakhem today', 'PERSON', 'Rima Zakhem');
  has("Khaled's number is", 'PERSON', 'Khaled');
  has('Joumana Haddad came to the centre', 'PERSON', 'Joumana Haddad');
  has('Jean-Marc is the neighbour', 'PERSON', 'Jean-Marc');
  has('حنان صعب في صيدا', 'PERSON', 'حنان صعب');
  has('وفاطمة جاءت', 'PERSON', 'فاطمة');
});

test('person: a name found once is found again, even alone', () => {
  const f = detect('Mrs Rima Haddad came. Later Haddad called. Rima left.').filter((s) => s.type === 'PERSON');
  assert.equal(f.length, 3);
});

test('person: ordinary words and places are not names', () => {
  lacks('The Organization office in Saida opens on Monday. Cash assistance is delayed.', 'PERSON');
  lacks('Please summarise this note. Thank you, see you in March.', 'PERSON');
  lacks('مالك المنزل طلب الإيجار. الأمل كبير. نور الشمس. صباح الجمعة.', 'PERSON');
  lacks('The hope is that faith in the process grows.', 'PERSON');
  lacks('He said it was fine. She said no.', 'PERSON');
});

test('person: ambiguous Arabic words need company or a cue', () => {
  lacks('لدينا أمل كبير', 'PERSON');
  lacks('وصلنا على عجل', 'PERSON');
  has('السيد أمل حداد', 'PERSON', 'أمل حداد');
});

test('user-supplied names and manual selections, any script', () => {
  has('Tell Gaelle in protection', 'PERSON', 'Gaelle', { extraNames: ['gaelle'] });
  has('Tell Gaelle Nasr in protection', 'PERSON', 'Gaelle Nasr', { extraNames: ['Gaelle Nasr'] });
  has('اتصلت تيماء الليلة', 'PERSON', 'تيماء', { extraNames: ['تيماء'] });
  has('Meet at Beit Mery clinic today', 'OTHER', 'Beit Mery clinic', { manual: [{ text: 'beit mery clinic', type: 'OTHER' }] });
  const m = detect('Room 12B and room 12B again', { manual: [{ text: '12B', type: 'OTHER' }] });
  assert.equal(m.filter((s) => s.type === 'OTHER').length, 2);
});

test('strict mode catches uncued capitalised names, default does not', () => {
  const t = 'Hagop Kalustian rang from the school yesterday.';
  lacks(t, 'PERSON');
  has(t, 'PERSON', 'Hagop Kalustian', { strict: true });
});

test('spans never overlap and always index into the original text', () => {
  const t = 'Mrs Hanan Saab (CS-2026-004817), born 02/08/1982, ID 12345678, tel +961 71 123 456, a@b.org, IBAN LB62 0999 0000 0001 0019 0122 9114, ابن خالد الحاج ٠٣ ١٢٣ ٤٥٦';
  const s = detect(t, { strict: true });
  for (let i = 0; i < s.length; i++) {
    assert.equal(t.slice(s[i].start, s[i].end), s[i].text);
    if (i) assert.ok(s[i].start >= s[i - 1].end, 'overlap at ' + i);
  }
  assert.ok(s.length >= 8);
});

test('empty and plain input', () => {
  assert.deepEqual(detect(''), []);
  assert.deepEqual(detect('Nothing personal here.'), []);
});
