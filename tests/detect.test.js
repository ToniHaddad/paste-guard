'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { detect, normDigits } = require('../src/detect.js');

const found = (text, opts) => detect(text, opts).map((s) => s.type + ':' + s.text);
const has = (text, type, value, opts) => {
  const f = detect(text, opts).filter((s) => s.type === type).map((s) => s.text);
  assert.ok(f.includes(value), `expected ${type} "${value}" in ${JSON.stringify(f)} for: ${text}`);
};
const lacks = (text, type, opts) => {
  const f = detect(text, opts).filter((s) => s.type === type);
  assert.equal(f.length, 0, `unexpected ${type}: ${JSON.stringify(f.map((s) => s.text))} in: ${text}`);
};

test('phones: Lebanese local and international', () => {
  has('call 03 456 789 today', 'PHONE', '03 456 789');
  has('call 71 234 567 today', 'PHONE', '71 234 567');
  has('landline 01 234 567', 'PHONE', '01 234 567');
  has('on +961 76 555 019.', 'PHONE', '+961 76 555 019');
  has('on 0096170123987 ok', 'PHONE', '0096170123987');
});

test('phones: Kenyan and Colombian', () => {
  has('mobile 0712 345 678', 'PHONE', '0712 345 678');
  has('+254 722 000 111', 'PHONE', '+254 722 000 111');
  has('celular 310 555 0142', 'PHONE', '310 555 0142');
  has('+57 300 123 4567', 'PHONE', '+57 300 123 4567');
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
  lacks('The household has 3 adults, 4 children and received 120 USD in 2024.', 'PHONE');
  lacks('Visited on 03-12-2024 and again 12/03/2025.', 'PHONE');
  lacks('Weight 12.5 kg, height 140 cm, age 34.', 'PHONE');
});

test('email and IBAN', () => {
  has('write to a.b-c@example.org please', 'EMAIL', 'a.b-c@example.org');
  has('IBAN LB62 0999 0000 0001 0019 0122 9114 for transfer', 'IBAN', 'LB62 0999 0000 0001 0019 0122 9114');
  has('IBAN GB82WEST12345698765432.', 'IBAN', 'GB82WEST12345698765432');
  has('IBAN: DE89 3704 0044 0532 0130 00 DOB', 'IBAN', 'DE89 3704 0044 0532 0130 00');
  lacks('code AB12 is the room', 'IBAN');
});

test('case numbers (fictional format)', () => {
  has('file NBR-LB-2024-004817 open', 'CASE', 'NBR-LB-2024-004817');
  has('household HH-KE-33012', 'CASE', 'HH-KE-33012');
  has('ملف NBR-CO-2025-000123', 'CASE', 'NBR-CO-2025-000123');
  lacks('code XYZ-LB-2024-004817', 'CASE');
});

test('date of birth only after a cue', () => {
  has('born 14/05/1991 in Nairobi', 'DOB', '14/05/1991');
  has('DOB: 2 August 1982', 'DOB', '2 August 1982');
  has('née le 7 juillet 1990', 'DOB', '7 juillet 1990');
  has('تاريخ الميلاد: ٢١/٠١/١٩٦٥', 'DOB', '٢١/٠١/١٩٦٥');
  has('من مواليد 1987', 'DOB', '1987');
  has('her date of birth is 3 June 1999', 'DOB', '3 June 1999');
  lacks('Visit on 14/05/2025, follow-up 2 August 2025.', 'DOB');
});

test('ID and passport numbers', () => {
  has('Passport RL4567812.', 'ID', 'RL4567812');
  has('RL4567812 was lost', 'ID', 'RL4567812');
  has('national ID is 23456789 on file', 'ID', '23456789');
  has('carte d’identité n° 034567891234', 'ID', '034567891234');
  has('her cédula as 1.098.765.432', 'ID', '1.098.765.432');
  has('UNHCR number 123-24C01234 next', 'ID', '123-24C01234');
  has('ID 000123456789', 'ID', '000123456789');
  has('رقم الهوية ٠٣٤٥٦٧٨٩١٢٣٤', 'ID', '٠٣٤٥٦٧٨٩١٢٣٤');
  lacks('ID 12', 'ID');
});

test('person: titles in English, French, Arabic', () => {
  has('Mrs Hanan Saab called', 'PERSON', 'Hanan Saab');
  has('Dr. Peter Otieno about', 'PERSON', 'Peter Otieno');
  has('Madame Odile Fontaine est venue', 'PERSON', 'Odile Fontaine');
  has('M. Jean-Claude Nasr a appelé', 'PERSON', 'Jean-Claude Nasr');
  has('Mme Aïcha Benali (passeport', 'PERSON', 'Aïcha Benali');
  has('اتصل السيد محمد الحاج بخصوص', 'PERSON', 'محمد الحاج');
  has('الدكتورة سميرة قاسم طلبت', 'PERSON', 'سميرة قاسم');
  has('السيدة إيفون جرجس.', 'PERSON', 'إيفون جرجس');
});

test('person: relational cues', () => {
  has('the daughter of Hassan Zakaria said', 'PERSON', 'Hassan Zakaria');
  has('Georges Haddad, fils de Michel, a signalé', 'PERSON', 'Michel');
  has('Her son Duván is out of school', 'PERSON', 'Duván');
  has('la tante, Zakia, garde', 'PERSON', 'Zakia');
  has('زوجها إلياس فقد عمله', 'PERSON', 'إلياس');
  has('جارتها رولا شهدت', 'PERSON', 'رولا');
});

test('person: gazetteer, growth to an unknown surname, possessive', () => {
  has('Zeinab Ahmad reports harassment', 'PERSON', 'Zeinab Ahmad');
  has('Dennis Ochola in Kibera', 'PERSON', 'Dennis Ochola');
  has("Khaled's number is", 'PERSON', 'Khaled');
  has('Wanjiru Kamau came to the helpdesk', 'PERSON', 'Wanjiru Kamau');
  has('She met Yesenia Cárdenas today', 'PERSON', 'Yesenia Cárdenas');
  has('حنان صعب في صيدا', 'PERSON', 'حنان صعب');
});

test('person: a name found once is found again, even alone', () => {
  const f = detect('Mrs Rima Haddad came. Later Haddad called. Rima left.').filter((s) => s.type === 'PERSON');
  assert.equal(f.length, 3);
});

test('person: ordinary words and places are not names', () => {
  lacks('The Northbridge Relief office in Beirut opens on Monday. Cash assistance is delayed.', 'PERSON');
  lacks('Please summarise this note. Thank you, see you in March.', 'PERSON');
  lacks('مالك المنزل طلب الإيجار. الأمل كبير. نور الشمس.', 'PERSON');
  lacks('The hope is that faith in the process grows.', 'PERSON');
});

test('person: ambiguous Arabic words need company or a cue', () => {
  lacks('لدينا أمل كبير', 'PERSON');
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
  const t = 'Afif Daoud rang from Zahle yesterday.';
  lacks(t, 'PERSON');
  has(t, 'PERSON', 'Afif Daoud', { strict: true });
});

test('spans never overlap and always index into the original text', () => {
  const t = 'Mrs Hanan Saab (NBR-LB-2024-004817), born 02/08/1982, ID 12345678, tel +961 71 123 456, a@b.org, IBAN LB62 0999 0000 0001 0019 0122 9114, ابن خالد الحاج ٠٣ ١٢٣ ٤٥٦';
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
