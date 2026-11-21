/*
 * Bundled name lists. Plain data, no logic.
 *
 * Common given and family names of Lebanon and the region (Lebanese, Syrian,
 * Palestinian, Iraqi and other Arabic names, many Christian and Muslim
 * names), in Latin spellings and in Arabic script, plus French given names
 * that are common in Lebanon and a few English ones. Written from general
 * knowledge, NOT from any real register. It is not a census: many real names
 * are missing, and that is the main way this tool can leak a name. See README.
 *
 * `ambiguousAr` lists words that are also ordinary words. They only count as
 * a name next to another name or after a cue (Mr, Mme, السيد, "son of" ...).
 */
(function () {
  'use strict';

  const en = {
    given: `Tony Joe Johnny Michael Peter John James David Daniel Paul Mark Charles George Edward Robert William
      Anthony Joseph Samuel Alexander Patrick Andrew Thomas Kevin Eric Ryan
      Mary Sarah Sara Julia Rose Susan Nancy Grace Helen Nicole Linda Anna Emma Maria Christine Rachel Rebecca
      Jessica Lisa Laura Julie Carol Diana Elizabeth Joyce Sandra Angela Natalie`.split(/\s+/),
    family: [],
  };

  const fr = {
    // French given names common among Lebanese families (mostly Christian communities)
    given: `Jean Pierre Paul Michel Georges Joseph Antoine Elie Élie Charles Marc Philippe Pascal Jacques Claude Roger
      Maurice Fernand Gaby Camille Louis André Henri François Nicolas Alexandre Daniel David Samuel Rodolphe Serge
      Gérard Jules Emile Émile Edmond Edgar Raymond Roland Rémy Sébastien Julien Christophe Thierry Olivier
      Marie Rita Nathalie Joëlle Joelle Sophie Hélène Helene Julie Céline Celine Karine Yvonne Odette Monique
      Simone Mireille Rose Rosette Thérèse Therese Léa Lea Sylvie Josiane Jocelyne Liliane Lilian Christelle
      Madeleine Antoinette Georgette Gisèle Gisele Lucie Lucienne Suzanne Hélène Aline Anne Isabelle Catherine
      Danielle Nadine Carole Caroline Cécile Cecile Claudine Colette Corinne Denise Émilie Emilie Estelle Françoise
      Ghislaine Irène Jeanne Laure Laurence Lorraine Magali Marguerite Martine Michèle Michele Muriel Nicole
      Pauline Renée Sandrine Solange Stéphanie Valérie Véronique Vanessa Yolande Aïcha Inès Maya
      Jean-Claude Jean-Pierre Jean-Paul Jean-Marc Jean-Louis Jean-François Marie-Claire Marie-Thérèse Anne-Marie
      Marie-Rose Marie-Louise Marie-José Pierre-Antoine Paul-Henri`.split(/\s+/),
    family: [],
  };

  const ar = {
    // Latin transliterations. Spelling varies a lot, so common variants are listed.
    given: `Ahmad Ahmed Ahmat Abbas Abdallah Abdullah Abdulla Abdelkader Abdelaziz Abdulaziz Abdelnasser Abdelrahman
      Abdulrahman Abdelhamid Abdelfattah Abdelsalam Abdelmajid Abdulkarim Abdelkarim Abdelwahab Abdelrazak Abdellatif
      Rahman Kader Qader Aziz Hamid Majid Wahab Salam Razzak Ghani Fattah Samad Basset Halim Latif Jalil Khalek Moneim Nasser
      Abed Adel Adnan Ahed Akram Alaa Ali Amer Ameen Amin Amir Anas Anis Antonios Ayman Ayoub Bachir Bashir Badih
      Bahaa Bahij Bashar Bassam Bassel Basil Bilal Boutros Chady Chadi Chafic Chucri Chukri Dani Elias Ilyas Emad Fadi Fady
      Fares Farid Farouk Fawzi Fawzy Firas Fouad Ghazi Ghassan Habib Hadi Hady Hamad Hamdi Hamza Hani Hasan Hassan
      Hassane Hatem Hazem Hicham Hisham Hosni Hussam Hussein Hussain Husein Imad Issam Iyad Jaber Jad Jamal Jamil Jawad
      Jihad Joumaa Kamal Karam Karim Kareem Kassem Qassem Khaled Khalid Khalil Khodr Louay Maher Majed Malek Mansour Marwan
      Maroun Mazen Mhamad Milad Mohamad Mohammad Mohammed Mohamed Muhammad Mohsen Mostafa Mustafa Moustafa Moussa Mousa
      Munir Nabil Nabih Nader Nadim Naim Najib Naji Nasri Nasser Nassim Nazih Nizar Omar Umar Osama Radwan Rabih Rachid
      Rashid Rafic Rafik Raed Rami Ramy Ramzi Ramez Raja Rayan Rida Riad Said Saeed Salah Salem Salim Selim Salman Samer
      Sami Samir Sleiman Suleiman Souheil Suhail Sultan Tamer Tarek Tariq Taleb Toufic Tawfik Wadih Wael Waleed Walid
      Wassim Wissam Yahya Yehia Yasser Yaser Youssef Yousef Yusuf Zaher Zakaria Zeid Zeyad Ziad Ziyad Zouheir Zuhair
      Hussam Mahdi Mazin Nouhad Nehme Naseem Raafat Rizk Sobhi Sobhy Shawki Shaker Shafic Sharif Sherif Tayseer
      Abir Aicha Aisha Alia Amal Amani Amina Asma Asmaa Bahia Bassima Batoul Dalal Dalia Dalya Dima Dina Doha Elham Farah
      Fatima Fatme Fatmeh Fadia Ghada Ghina Hala Hanadi Hanan Hanane Hayat Hiba Hind Hoda Houda Huda Ibtisam Ikram Iman
      Eman Inaya Jamila Joumana Khadija Khadiga Lama Layla Leila Laila Lina Lubna Maha Manal Mariam Maryam Marwa Maya
      Mayssa Mona Mouna Muna Nada Nadia Najwa Nawal Nayla Nisrine Nour Noura Nora Rabab Randa Rania Rasha Rawan Rayya
      Reem Rim Rima Rola Roula Ruba Rouba Salma Samar Samia Samira Sana Sanaa Sawsan Sirine Siham Souad Suad Soha
      Souha Tamara Tala Wafaa Wafa Yara Yasmin Yasmine Zahra Zainab Zeinab Zaynab Zeina Zakia Zouheira Hadia Hanna Bushra
      Fayrouz Fairouz Ranim Rouaa Sahar Salwa Sawsan Shireen Siham Widad Zahia Zeinat Najat Najla Nahla Nuha Nisreen
      Hayfa Haifa Ola Rasha Rahaf Rouba Raghda Raghad Ruqaya Sumaya Suzan Thuraya Wiam Wijdan Yomna Yosra Joud Judy Lourdes`.split(/\s+/),
    family: `Abboud Abdallah Abdelnour Abdo Aboud Achkar Atallah Ayoub Azar Azzi Bakri Barakat Basha Bassil
      Beydoun Bitar Boustany Boutros Chaaban Chahine Chamoun Chamseddine Chebli Chehab Chehade Chehadeh
      Chidiac Choueiri Daher Dagher Daou Daoud Darwish Dbouk Eid Fadlallah Fakhoury Farah Fares Farhat Fawaz Frem Frangieh
      Gebran Jebran Geagea Gemayel Ghanem Ghosn Gerges Hachem Hage Hajj Hakim Hamade Hamadeh Hammoud Hamdan Hamdi Harb
      Hariri Hassan Hawi Hayek Hobeika Hoballah Hoss Hourani Hussein Issa Itani Jaber Jabbour Jaafar Jammal Jarrah Jbeily
      Joumblatt Kanaan Karam Kassab Kassem Kfoury Khalaf Khalil Khatib Khoder Khoury Khouri Kobeissi Lahoud Maalouf Mahfoud
      Makhlouf Mansour Mansouri Mattar Matar Mawla Merhi Mikati Moawad Mouawad Mourad Moussa Mrad Murr Nahas Najjar
      Nakhle Naccache Nasr Nasrallah Nasser Nassar Nehme Nouri Obeid Osman Rahal Rahme Raad Ramadan Rizk Rifai Saab Saadeh
      Sabbagh Sabra Sader Safadi Sakr Saleh Salameh Salem Saliba Salloum Sarkis Sayegh Semaan Sfeir Shaar Shaito
      Shehadeh Slaiman Sleiman Soubra Srour Tabet Tannous Tawil Tarabay Tohme Tueni Yacoub Yaacoub Yammine Yazbeck Younes Zahar
      Zaidan Zeidan Zakhour Zein Zoghbi Zeineddine Hamieh Hammoud Fneish Jaroudi Kaadan Haidar Hijazi Halabi Homsi Hamwi
      Masri Kurdi Zoubi Shami Dayoub Hanna Hallak Dimashqi Rustom Nahle Jarjour Kordahi Karameh Salhab Mcheik Mchantaf
      Harati Hakim Hatoum Hatoum Ismail Itany Tarraf Merheb Matta Bsat Daccache Saadeh Yammine Eddé Edde Aoun Atiyeh
      Bazzi Baydoun Berjawi Chalhoub Chedid Chammas Dahdah Dakdouk Doumit Ezzedine Faour Ghannam Haddad Hadad Hamze
      Hashem Karameh Kayrouz Kazzi Khazen Lteif Maroun Moghabghab Moukarzel Nader Nakad Nemer Rasamny Raphael Sawaya
      Skaff Succar Tabbal Tarazi Tayyar Tawk Wehbe Wehbi Yassin Zakaria Ziadeh Zoueihid Din Eddine Eldin Abidine`.split(/\s+/),
    // Arabic script. Family names are written without the leading definite article.
    givenAr: `أحمد احمد عباس عبدالله عبدالقادر عبدالعزيز عبدالناصر عبدالرحمن عبدالحميد عبدالفتاح عبدالسلام عبدالمجيد عبدالكريم
      عبدالوهاب عبداللطيف عبدالرزاق عابد عادل عدنان أكرم اكرم علاء علي عامر أمين امين أمير امير أنس أنيس أنطونيوس أيمن
      أيوب ايوب بشير بديع بهاء بهيج بشار بسام باسل بلال بطرس شادي شفيق شكري داني إلياس الياس إيلي ايلي عماد فادي فارس
      فريد فاروق فوزي فراس فؤاد غازي غسان حبيب هادي حمد حمدي حمزة هاني حسن حسين حاتم حازم هشام حسني حسام إبراهيم
      ابراهيم إسماعيل اسماعيل عصام إياد اياد جابر جاد جمال جميل جواد جهاد جمعة كمال كرم كريم قاسم خالد خليل خضر لؤي
      ماهر ماجد مالك منصور مروان مارون مازن محمد محمود مصطفى موسى منير نبيل نبيه نادر نديم نعيم نجيب ناجي ناصر نسيم
      نزيه نزار عمر أسامة اسامة رضوان ربيع رشيد رفيق رائد رامي رمزي رامز رجا ريان رضا رياض سعيد سالم صلاح سليم سلمان
      سامر سامي سمير سليمان سهيل سلطان تامر طارق طالب توفيق وديع وائل وليد وسيم وسام يحيى ياسر يوسف زاهر زكريا زيد زياد
      زهير مهدي مازن نهاد نعمة رافت صبحي شوقي شاكر شريف تيسير فرح
      عبير عائشة عالية أمل امل أماني امينة أسماء بهية بسيمة بتول دلال داليا دينا ديما دعاء الهام فرح فاطمة فادية غادة
      غنى هلا هنادي حنان هيام هبة هند هدى هدى هيفاء إبتسام ابتسام إكرام اكرام إيمان ايمان جميلة جمانة جومانة خديجة لمى
      ليلى لينا لبنى مها منال مريم مروة مايا ميساء منى مي ندى نادين نادية نجوى نوال نايلة نسرين نور نورا ربى رندة راندا
      رانيا رشا روان ريم ريما رولا رلى روبا رباب سلمى سمر سامية سميرة سناء سارة سوسن سيرين سهام سعاد سها سهى تمارا
      وفاء ياسمين زهراء زينب زينة زكية زهيرة هديل فيروز رنيم صفاء سحر سلام ريان رهف رغدة رقية سمية سوزان ثريا وئام
      وجدان يمنى يسرى جود جودي نجلاء نهلة نهى نجاة نجلا باسكال`.split(/\s+/),
    familyAr: `عبود عبدالله عبدالنور عبدو عشقر عطالله أيوب ايوب عزار عزي بكري بركات باشا باسيل بيضون بيطار
      بستاني بطرس شعبان شاهين شمعون شبلي شديد شيدياق شويري ضاهر دغر داود درويش دبوق عيد فضل الله فاخوري فرح
      فارس فرحات فواز فرم فرنجية جبران جعجع الجميل غانم غصن جرجس هاشم حاج حكيم حمادة حمادي همود حمدان حمدي حرب حريري
      حسن حوي حايك هبيقة حبيقة هوبلاح حص حوراني حسين عيسى إيتاني ايتاني جابر جبور جعفر جمال جراح جبيلي جنبلاط كنعان كرم
      كساب قاسم كفوري خلف خليل خطيب خضر خوري كبيسي لحود معلوف محفوض مخلوف منصور منصوري مطر مولى مرعي ميقاتي معوض
      مراد مرعب مراد مرّ نحاس نجار ناكوزي نخلة نقاش نصر نصرالله ناصر نصار نعمة نوري عبيد عثمان رحال رحمة رعد رمضان رزق
      رفاعي سعب صعب سعادة صباغ صبرا سادر صدر صافدي صقر صالح سلامة سالم صليبا سلوم سركيس صايغ سمعان صفير شعار شيتو شحادة
      سليمان سرور طبّات طبّ طنوس طويل طرابلسي طعمة طحان تويني يعقوب يمين يزبك يونس زهار زيدان زخور زغبي زين
      حميه فنيش جارودي قعدان حيدر حجازي حلبي حمصي حموي مصري كردي زعبي شامي دياب حنا حلاق دمشقي رستم نحلة جرجور
      كردحي كرامة مشيك مشنتف حراتي حاطوم إسماعيل اسماعيل طراف مرهج متى بسط دكاش بزي برجاوي شلهوب شديد شماس دحداح
      دقدوق دومط فعور غنام قزي خازن لطيف مارون موسى معوض مقرزل نادر ناكد نمر سوايا سكاف سكر تبال طيار طوق وهبه
      ياسين زكريا زيادة`.split(/\s+/),
    // Words that are also common words: only count in a run of 2+ or after a cue.
    ambiguousAr: `مالك جمعة نور أمل هدى سعيد ندى حسن كريم جميلة سلمى سعاد وفاء هند سناء رشا نبيل منى مها سلام جميل كمال
      جمال مصري حلبي نجار خطيب حكيم حاج عيد فارس زين صدر طويل ياسين حرب فرح ريان رحمة شامي تركي كردي أمين
      امين عون سرور شرف مراد علي نعمة طعمة حمد سالم رجا فضل نمر صقر نادر شديد ربيع رزق صالح ماهر
      سلام جود غنى هلا مي ريم رلى رعد باشا`.split(/\s+/),
    ambiguousLat: ['said', 'hope', 'faith', 'rose', 'grace', 'mark', 'joy'],
  };

  // Capitalised words that are not people. They stop a name from growing.
  const stopLat = `Organization Organisation Lebanon Liban Beirut Beyrouth Tripoli Tripoli Saida Saïda Sidon Tyre Tyr Baalbek Baalbeck
    Zahle Zahlé Jbeil Byblos Jounieh Halba Akkar Bekaa Bekaa Nabatieh Batroun Aley Chouf Metn Keserwan Koura Hermel
    Dekwaneh Achrafieh Hamra Verdun Chiyah Ghobeiri Bourj Hammoud Dahieh Sin Fil Jdeideh Mansourieh Jnah Tariq
    Hospital Clinic Clinique Centre Center Centro Office Bureau Street Road Rue Avenue Camp Camps School Ecole École
    Church Mosque Hotel Bank Banque Ministry Ministère Department Programme Program Project Projet Team Equipe
    Équipe Unit Cash Food Shelter Protection Health Education Case Cases Referral Household Family Famille
    Beneficiary Bénéficiaire Complaint Plainte Safeguarding Hotline Helpdesk Warehouse Dépôt Depot Waybill Bordereau
    Monday Tuesday Wednesday Thursday Friday Saturday Sunday Lundi Mardi Mercredi Jeudi Vendredi Samedi Dimanche
    January February March April May June July August September October November December Janvier Février Mars Avril
    Mai Juin Juillet Août Septembre Octobre Novembre Décembre USD LBP IBAN WH DSP RCV TRF DMG
    The Dear Please Thanks Thank Merci Bonjour Bonsoir Hello Hi Salut Dr Mr Mrs Ms Mme M Mlle Madame Monsieur Email
    Phone Tel Tél Mobile Courriel Mail Registration Registre Dossier Numéro Number ID Passport Passeport DOB
    Contact Call Visit Visite Notes Note Summary Résumé Rapport Report Interview Entretien Appel Meeting Follow
    Follow-up Referred Orienté Mount Beit Jabal Wadi Nahr Dhabi Landlord Tenant Locataire Propriétaire Caller
    Appelant Driver Chauffeur Keeper Hygiene Hygiène Mattress Armenian Syrian Lebanese Palestinian French Arabic English
    Night Overnight Hier Hi Hello Rent Loyer Contract Contrat Payment Virement Transfer`.split(/\s+/);

  const stopAr = `في من إلى الى على عن مع قال قالت أفاد أفادت اتصل اتصلت حضر حضرت زار زارت طلب طلبت أبلغ ابلغ أبلغت ذكر ذكرت
    يقيم تقيم يعمل تعمل وصل وصلت أخبر اخبر أخبرت بخصوص حول هو هي هذا هذه ذلك التي الذي لا لم لن قد كان كانت
    ان إن أن أنه انه أنها انها ثم و أو او بعد قبل عند لدى منذ حتى الى ابنها ابنه ابنته بنتها زوجها زوجته زوجتها
    والدها والدته والدتها أخوها أخوه أخته أخيه عمه خاله عمها خالتها أمه أمها أباه أبيها شكوى مساعدة طلب ملف رقم
    الاسرة الأسرة العائلة عائلة أطفال طفل طفلة اطفال أولاد مريض مريضة متعب مصاب غائب حاضر موجود جديد كبير صغير
    سنوات سنة سنين شخص أشخاص اشخاص عائلات`.split(/\s+/);

  const api = { en, fr, ar, stopLat, stopAr };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { globalThis.PG = globalThis.PG || {}; globalThis.PG.gazetteer = api; }
})();
