/*
 * Bundled name lists. Plain data, no logic.
 *
 * These are common given and family names, written from general knowledge
 * for five language communities. They are NOT a census: many real names are
 * missing, and that is the main way this tool can leak a name. See README.
 *
 * `ambiguous` lists words that are also ordinary words. They only count as a
 * name next to another name or after a cue (Mr, Mme, السيد, "son of" ...).
 */
(function () {
  'use strict';

  const en = {
    given: `James John Robert Michael William David Richard Joseph Thomas Charles Christopher Daniel Matthew Anthony
      Donald Steven Paul Andrew Joshua Kenneth Kevin Brian George Edward Ronald Timothy Jason Jeffrey Ryan Jacob
      Gary Nicholas Eric Jonathan Stephen Larry Justin Scott Brandon Benjamin Samuel Gregory Alexander Patrick
      Frank Raymond Jack Dennis Jerry Tyler Aaron Henry Peter Douglas Nathan Peter Adam Zachary Walter Kyle Harold
      Mary Patricia Jennifer Linda Elizabeth Barbara Susan Jessica Sarah Karen Nancy Lisa Betty Margaret Sandra
      Ashley Kimberly Emily Donna Michelle Carol Amanda Dorothy Melissa Deborah Stephanie Rebecca Sharon Laura
      Cynthia Kathleen Amy Angela Shirley Anna Brenda Pamela Emma Nicole Helen Samantha Katherine Christine
      Debra Rachel Carolyn Janet Catherine Maria Heather Diane Olivia Julie Joyce Victoria Kelly Christina
      Lauren Joan Evelyn Judith Megan Cheryl Andrea Hannah Jacqueline Martha Gloria Teresa Sara Janice Julia
      Marie Madison Abigail Alice Judy Sophia Rose Denise Beverly Danielle Theresa Marilyn Diana Brittany
      Natalie Charlotte Kayla Alexis Lori Ruth Eleanor Naomi Esther Leah`.split(/\s+/),
    family: `Smith Johnson Williams Jones Taylor Davies Wilson Evans Thomas Roberts Walker Wright Robinson Thompson
      White Hughes Edwards Hall Wood Harris Clarke Jackson Clark Turner Hill Moore Martin Lee Allen Mitchell
      Campbell Anderson Scott Morgan Cooper Ward Murphy Bailey Bell Carter Collins Phillips Parker Patel
      Richardson Cook Watson Brooks Kelly Henderson Reid Fraser Stewart Ross Murray Graham Hamilton Gordon`.split(/\s+/),
  };

  const fr = {
    given: `Jean Pierre Michel Philippe Alain Patrick Nicolas Christophe Laurent Daniel Éric Eric Stéphane Pascal
      Thierry Olivier Sébastien Julien Maxime Mathieu Antoine Guillaume Alexandre Thomas Vincent Bruno Gérard
      Claude Jacques André Louis François Henri Marcel Bernard Yves Dominique Frédéric Hugo Lucas Théo Gabriel
      Marie Nathalie Isabelle Sylvie Catherine Françoise Monique Christine Martine Nicole Sophie Valérie Brigitte
      Anne Hélène Camille Chloé Léa Manon Emma Inès Sarah Julie Laure Céline Aurélie Véronique Jeanne 
       Simone Colette Josette Danielle Cécile Mathilde Élodie Océane Margaux Pauline Clémence Esther
      Jean-Claude Jean-Pierre Jean-Paul Marie-Claire Anne-Marie  Aïcha Fatou Mamadou Ousmane Moussa
      Ibrahima Aminata Awa Mariama Kadiatou  Pascaline Fabrice Didier`.split(/\s+/),
    family: `Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Laurent Lefebvre Michel
      Garcia David Bertrand Roux Vincent Fournier Morel Girard André Lefèvre Mercier Dupont Lambert Bonnet
      François Martinez Legrand Garnier Faure Rousseau Blanchard Guérin Muller Henry Roussel Nicolas Perrin
      Morin Mathieu Clément Gauthier Dumont Lopez Fontaine Chevalier Robin Masson Sanchez Gérard Nguyen Boyer
      Traoré Diallo Camara Konaté Ouédraogo Sow Ndiaye Diop Kouassi   `.split(/\s+/),
  };

  const sw = {
    given: `Juma Hamisi Rajabu Saidi Bakari Salim Omari Athumani Mussa Baraka Tumaini Upendo Furaha Neema Zawadi
      Rehema Imani Zuhura Fatuma Halima Mwanaisha Asha Amina Salma Mariam Zainabu Hawa Mwajuma Grace Faraja
      Wanjiru Njeri Wambui Wangari Muthoni Mumbi Nyambura Wairimu Njoki Kamau Mwangi Kariuki Njoroge Kimani
      Maina Githinji Gitau Mutua Musyoka Kioko Kyalo Mwende Mutheu Otieno Odhiambo Onyango Omondi Ochieng
      Achieng Atieno Akinyi Adhiambo Awuor Anyango Apiyo Wafula Wekesa Barasa Simiyu Naliaka Nekesa Nafula
      Kiprono Kipchoge Kiptoo Kibet Kipkemboi Cheruiyot Chebet Jepchirchir Jeptoo Chepkoech Kosgei Rotich
      Kiplagat Kimutai Korir Langat Ruto Tanui Mwalimu Wekhomba Peter Samuel James Joseph John Esther Ruth
       Nyokabi Wacera Wanjiku Waithera Waweru Mbugua Macharia Kamande Gathoni`.split(/\s+/),
    family: `Mwangi Kamau Otieno Odhiambo Onyango Omondi Ochieng Njoroge Kariuki Kimani Maina Mutua Wafula
      Wekesa Barasa Kiprono Kipchoge Cheruiyot Korir Langat Rotich Tanui Mbugua Macharia Waweru Gitau Githinji
      Kilonzo Mutiso Musau Nzioka Mulwa Wambua Ndung'u Karanja Kinyanjui Mugo Kiarie Ngugi Nyaga Mwaura
      Juma Hassan Ali Salim Mohamed Abdi Hussein Warsame Farah Omar`.split(/\s+/),
  };

  const es = {
    given: `José Jose Juan Luis Carlos Jorge Miguel Pedro Pablo Fernando Alejandro Andrés Andres Santiago Sebastián
      Sebastian Daniel David Diego Javier Manuel Francisco Antonio Ricardo Roberto Eduardo Rafael Mauricio
      Camilo Felipe Gustavo Héctor Hector Hernán Iván Ivan Julián Julian Mario Nelson Óscar Oscar Orlando Rodrigo
      Wilson Edwin Jhon Yeison Brayan Alexander Cristian Fabián Fabian Germán German Harold Hugo Jairo Jaime
      María Maria Ana Sofía Sofia Camila Valentina Isabella Daniela Paola Laura Carolina Natalia Luz Marta Martha
      Yolanda Gloria Rosa Elena Isabel Claudia Liliana Sandra Patricia Nelly Diana Adriana Alejandra Angélica
      Beatriz Blanca Cecilia Consuelo Dolores Emilia Esperanza Fanny Gladys Inés Ines Jenny Johana Karen Leidy
      Lucía Lucia Luisa Marcela Margarita Mercedes Mónica Monica Nancy Nidia Olga Piedad Pilar Ramona Sonia Teresa
      Tatiana Viviana Yamile Yesica Zulma Ximena Catalina Lorena Milena Rocío Rocio`.split(/\s+/),
    family: `García Garcia Rodríguez Rodriguez Martínez Martinez López Lopez González Gonzalez Pérez Perez Sánchez
      Sanchez Ramírez Ramirez Torres Flores Rivera Gómez Gomez Díaz Diaz Hernández Hernandez Vargas Castro Moreno
      Rojas Ortiz Jiménez Jimenez Muñoz Munoz Ruiz Álvarez Alvarez Romero Suárez Suarez Herrera Medina Aguirre
      Cárdenas Cardenas Cortés Cortes Mejía Mejia Restrepo Arango Ospina Londoño Londono Valencia Gutiérrez
      Gutierrez Ramos Mendoza Guerrero Morales Silva Castillo Salazar Cruz Reyes Navarro Ríos Rios Parra Peña Pena
      Cano Duque Giraldo Zapata Quintero Bedoya Ocampo Marín Marin Osorio Franco Acosta Sierra Pineda`.split(/\s+/),
  };

  const ar = {
    // Latin transliterations. Spelling varies a lot, so common variants are listed.
    given: `Ahmad Ahmed Mohammad Mohamad Muhammad Mohamed Mohammed Mahmoud Mahmud Hassan Hasan Hussein Hussain Husein
      Ali Omar Umar Khaled Khalid Youssef Yousef Yusuf Joseph Ibrahim Ismail Ismael Mustafa Mostafa Moustafa
      Abdallah Abdullah Abdulla Abdelrahman Abdulrahman Abdelkader Abdelaziz Abdulaziz Abdelnasser Samir Samer
      Sami Nabil Walid Waleed Karim Kareem Tarek Tariq Hadi Hani Hanan Hanane Rima Rania Layla Leila Laila Fatima
      Fatme Fatmeh Zeinab Zainab Zaynab Mariam Maryam Mona Nour Noura Nora Salma Sara Sarah Amal Hiba Dalal Dina
      Dima Rasha Ghada Huda Hoda Jamila Jamal Kamal Majed Maher Marwan Bilal Rami Ramzi Riad Rabih Elie Elias
      Georges George Antoine Michel Charbel Tony Nadine Nada Lina  Carla Joumana Samira Souad Suad Wafaa
      Hind Ayman Adnan Bassam Bassel Fadi Fares Firas Hamza Hamad Hamid Hussam Imad Iyad Jad Jihad Louay Malek
      Mazen Nizar Osama Radwan Raed Saeed Said Salim Salah Sana Sanaa Shadi Sultan Wael Yasmin Yasmine Zahra
      Zeina Zein Ola Reem Rim Hala Houda Mireille Rabab Siham Khadija Khadiga Aisha Aicha Asma Nawal Najwa
      Manal Maya Mayssa Ziad Ziyad Zaher Anwar Hussam  Mohsen Nasser Nassim Naji Hisham Hicham Rashid
      Rachid Rafic Rafik Raymond Ramez Pascal  Elias Ilyas Issam Jawad Jaber Kassem Qassem  Lama
      Joelle Rita Rana  Myriam  Nisrine Randa Rouba Sawsan Sylvana Tala Yara Yasser Yaser Zakaria
      Ziyad Abdel Abdul Bachir Bashir Basil Bahaa Chadi Cynthia Dani Edgar Elham Eman Iman Farah Fouad
      Ghaith Habib Hazem Hosni Jamil Lubna Mahdi Mazin Mona Mouna Muna Nabih Nadim Nadia Naeem Rayan Ranim
      Safaa Safa Sahar Salam Samia Sawsan Selim Sleiman Suleiman Taleb Tamer Tamara Wissam Wajdi Yahya Yehia
      Zouheir Zuhair Zouhair Maha Mahasen Marwa Rawan Roula Sally Samar Shireen Sirine Soha Souha Yomna`.split(/\s+/),
    family: `Khoury Haddad Saab Nasser Nassar Hariri Mansour Sleiman Slaiman Hamdan Hamade  Hamdi Khalil Issa
      Ghanem Rahme Aoun Geagea Frem Karam Chidiac Daher Daou Fakhoury Hakim Hajj Hijazi Jaber Kassem Kassab Kanaan
      Mouawad Moussa Mrad Najjar Nakhle Obeid Rizk Sabbagh Saliba Salameh Sayegh Shami Tannous Yazbeck Zein
      Zahran Masri Halabi Hourani Qassem Darwish Abboud Amin Ayoub Bakri Barakat Chehab Dagher Eid Fares Ghosn
      Harb Hayek Hobeika Jabbour Khatib Maalouf Matar Nahas Osman Rahal Sfeir Shehadeh Srour Taha Tawil Younes
      Yassine Jundi Hamwi Homsi Hamoui Kurdi Turk Bitar   Salam    Ghazal Zaarour
      Moawad Gemayel  Frangieh Joumblatt Arslan Sader Berri Mikati Salhab Tohme Tueni Daccache Abi Nader
      Khoder Hussein Ahmad Mohammad Ali Hassan Mahmoud Abdallah Ibrahim Youssef Omar Suleiman Said Salim Mourad
      Naccache Nehme Semaan  Awad Bou Zakhour Beydoun Ramadan Shaaban  Fawaz Charafeddine Mcheik
      Chaaban Zaidan Zeidan Kobeissi Merhi Mekdad Moukalled Nouri Noureddine Orfali Rifai Safadi Sidani`.split(/\s+/),
    // Arabic script. Family names are written without the leading definite article.
    givenAr: `أحمد محمد محمود حسن حسين علي عمر خالد يوسف إبراهيم ابراهيم إسماعيل اسماعيل مصطفى عبدالله عبدالرحمن
      عبدالقادر عبدالعزيز عبدالناصر سمير سامر سامي نبيل وليد كريم طارق هادي هاني حنان ريما رانيا ليلى فاطمة
      زينب مريم منى نور نورا سلمى سارة أمل هبة دلال دينا ديما رشا غادة هدى جميلة جمال كمال ماجد ماهر مروان
      بلال رامي رمزي رياض ربيع إيلي الياس إلياس جورج جوزيف أنطوان ميشال شربل نادين ندى لينا  كارلا جمانة
      سميرة سعاد وفاء هند أيمن عدنان بسام باسل فادي فارس فراس حمزة حمد حامد حسام عماد إياد جهاد لؤي مالك مازن
      نزار أسامة رائد سعيد سالم مالك صلاح سناء سناء شادي سلطان وائل ياسمين زهراء زينة ريم هلا هالة خديجة عائشة
      أسماء نوال نجوى منال مايا ميساء زياد زاهر أنور  محسن ناصر نسيم ناجي هشام راشد رفيق رفيق ريمون رامز
      باسكال  عصام جواد جابر قاسم  لمى جويل ريتا رنا  ميريام  نسرين راندا ربى سوسن سيلفانا
      تالا يارا ياسر زكريا بشير بهاء شادي سيندي إدغار ايمان إيمان فرح فؤاد غيث حبيب حازم جميل لبنى مهدي
      نبيه نديم نادية نعيم ريان صفاء سحر سلام سامية سليم سليمان طالب تامر تمارا وسام يحيى زهير ماهر مها
      مروة روان روزا سالي سمر شيرين سيرين سهى سها يمنى مريم`.split(/\s+/),
    familyAr: `خوري حداد صعب ناصر نصار حريري منصور سليمان حمدان حمادة  خليل عيسى غانم رحمة عون جعجع فرم كرم
      شيدياق ضاهر داود فاخوري حكيم حاج حجازي جابر قاسم كساب كنعان معوض موسى مراد نجار ناكوزي عبيد رزق
      صباغ صليبا سلامة صايغ شامي طنوس يزبك زين زهران مصري حلبي حوراني درويش عبود أمين ايوب أيوب بكري
      بركات شهاب دغر عيد فارس غصن حرب حايك هبيقة جبور خطيب معلوف مطر نحاس عثمان رحال صفير شحادة سرور
      طه طويل يونس ياسين جندي حموي حمصي كردي تركي بيطار   سلام   غزال زعرور جميل
      شمعون فرنجية جنبلاط أرسلان صدر بري ميقاتي صلحب طعمة تويني دكاش خضر حسين احمد أحمد محمد علي حسن محمود
      عبدالله ابراهيم إبراهيم يوسف عمر سعيد سالم مالك مراد نقاش نعمة سمعان سركيس عواد ابو زخور بيضون رمضان
      شعبان فواز شرف الدين مشيك زيدان قبيسي مرعي مقداد مقدّد نوري رفاعي صافدي صيداني`.split(/\s+/),
    // Words that are also common words: only count in a run of 2+ or after a cue.
    ambiguousAr: `مالك نور أمل هدى سعيد ندى حسن كريم جميلة سلمى سعاد وفاء هند سناء رشا نبيل منى مها سلام جميل كمال
      جمال مصري حلبي نجار خطيب حكيم حاج عيد فارس زين صدر طويل ياسين حرب فرح ريان رحمة شامي تركي كردي أمين
      امين عون سرور شرف مراد علي نعمة طعمة حمد سالم`.split(/\s+/),
    ambiguousLat: ['said', 'amal', 'nour', 'hind', 'amin', 'faith', 'hope'],
  };

  // Capitalised words that are not people. They stop a name from growing.
  const stopLat = `Northbridge Relief Lebanon Kenya Colombia Beirut Nairobi Bogotá Bogota Tripoli Bekaa Zahle Zahlé Saida
    Saïda Sidon Tyre Baalbek Baalbeck Jounieh Dekwaneh Hammam Nabatieh Akkar Kakuma Dadaab Eldoret Mombasa
    Kisumu Nakuru Cúcuta Cucuta Medellín Medellin Cali Soacha Bucaramanga Barranquilla Cartagena Arauca Quibdó
    Hospital Clinic Clinique Centre Center Office Bureau Street Road Rue Avenue Camp Camps School Church Mosque
    Hotel Bank Ministry Department Programme Program Project Team Unit Cash Food Shelter Protection Health
    Education Case Cases Referral Household Family Famille Familia Familias Beneficiary Bénéficiaire Complaint
    Plainte Safeguarding Monday Tuesday Wednesday Thursday Friday Saturday Sunday Lundi Mardi Mercredi Jeudi
    Vendredi Samedi Dimanche Lunes Martes Miércoles Jueves Viernes Sábado Domingo January February March April
    May June July August September October November December Janvier Février Mars Avril Mai Juin Juillet Août
    Septembre Octobre Novembre Décembre Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre
    Noviembre Diciembre UNHCR WFP UNICEF IOM ICRC The Dear Please Thanks Thank Merci Bonjour Hello Hi Dr Mr Mrs Ms
    Mme M Mlle Madame Monsieur Email Phone Tel Tél Mobile Courriel Mail Registration Registre Dossier Numéro
    Number ID Passport Passeport DOB Contact Call Visit Visite Notes Note Summary Résumé Rapport Report
    Interview Entretien Appel Meeting Reunión Follow Follow-up Referred Orienté Hotline Helpdesk Mount Beit Bourj
    Jabal Wadi Nahr Dhabi`.split(/\s+/);

  const stopAr = `في من إلى الى على عن مع قال قالت أفاد أفادت اتصل اتصلت حضر حضرت زار زارت طلب طلبت أبلغ ابلغ أبلغت ذكر ذكرت
    يقيم تقيم يعمل تعمل وصل وصلت أخبر اخبر أخبرت بخصوص حول هو هي هذا هذه ذلك التي الذي لا لم لن قد كان كانت
    ان إن أن أنه انه أنها انها ثم و أو او بعد قبل عند لدى منذ حتى الى ابنها ابنه ابنته بنتها زوجها زوجته زوجتها
    والدها والدته والدتها أخوها أخوه أخته أخيه عمه خاله عمها خالتها أمه أمها أباه أبيها شكوى مساعدة طلب ملف رقم
    الاسرة الأسرة العائلة عائلة أطفال طفل طفلة اطفال أولاد`.split(/\s+/);

  const api = { en, fr, sw, es, ar, stopLat, stopAr };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { globalThis.PG = globalThis.PG || {}; globalThis.PG.gazetteer = api; }
})();
