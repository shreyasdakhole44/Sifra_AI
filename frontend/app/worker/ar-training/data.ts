export interface OptionData {
  text_en: string;
  text_mr: string;
  isCorrect: boolean;
  feedback_en: string;
  feedback_mr: string;
}

export interface QuestionData {
  question_en: string;
  question_mr: string;
  options: OptionData[];
}

export interface RuleData {
  id: number;
  title: string;
  learning_objective_en: string;
  learning_objective_mr: string;
  questions: QuestionData[];
}

export const IOGP_SCENARIOS: Record<number, RuleData> = {
  1: {
    id: 1,
    title: "Bypassing Safety Controls",
    learning_objective_en: "Never bypass or restart a safety control without proper authorization.",
    learning_objective_mr: "योग्य परवानगीशिवाय कधीही सेफ्टी कंट्रोल बायपास किंवा रीस्टार्ट करू नका.",
    questions: [
      {
        question_en: "A safety guard has been bypassed on this machine. What should you do?",
        question_mr: "या मशीनवरील सेफ्टी गार्ड बायपास केला आहे. तुम्ही काय केले पाहिजे?",
        options: [
          { text_en: "Stop work and report it", text_mr: "काम थांबवा आणि तक्रार करा", isCorrect: true, feedback_en: "Correct. Never work on bypassed equipment.", feedback_mr: "बरोबर. बायपास केलेल्या उपकरणांवर कधीही काम करू नका." },
          { text_en: "Continue operating carefully", text_mr: "काळजीपूर्वक काम सुरू ठेवा", isCorrect: false, feedback_en: "Unsafe. Working without a guard can cause severe injury.", feedback_mr: "असुरक्षित. गार्डशिवाय काम केल्यास गंभीर दुखापत होऊ शकते." },
          { text_en: "Put the guard back yourself and continue", text_mr: "स्वतः गार्ड परत लावा आणि सुरू ठेवा", isCorrect: false, feedback_en: "Unsafe. The machine must be inspected before restarting.", feedback_mr: "असुरक्षित. रीस्टार्ट करण्यापूर्वी मशीनची तपासणी करणे आवश्यक आहे." }
        ]
      },
      {
        question_en: "Who should authorize restarting this machine?",
        question_mr: "ही मशीन पुन्हा सुरू करण्यासाठी कोणी परवानगी द्यावी?",
        options: [
          { text_en: "A supervisor, after proper inspection", text_mr: "योग्य तपासणीनंतर पर्यवेक्षक", isCorrect: true, feedback_en: "Correct. Only authorized personnel can approve restarts.", feedback_mr: "बरोबर. फक्त अधिकृत व्यक्तीच रीस्टार्टला मंजुरी देऊ शकतात." },
          { text_en: "Anyone on shift", text_mr: "शिफ्टवरील कोणीही", isCorrect: false, feedback_en: "Unsafe. Unauthorized restarts violate safety protocols.", feedback_mr: "असुरक्षित. अनधिकृत रीस्टार्ट सुरक्षा नियमांचे उल्लंघन करतात." },
          { text_en: "No authorization needed", text_mr: "कोणत्याही परवानगीची गरज नाही", isCorrect: false, feedback_en: "Unsafe. Authorization is always required.", feedback_mr: "असुरक्षित. नेहमी परवानगी आवश्यक असते." }
        ]
      }
    ]
  },
  2: {
    id: 2,
    title: "Confined Space Entry",
    learning_objective_en: "Confined space entry needs a permit, atmosphere testing, and rescue arrangements — always, no exceptions.",
    learning_objective_mr: "कन्फाइन्ड स्पेस प्रवेशासाठी परमिट, हवेची तपासणी आणि बचाव व्यवस्था आवश्यक आहे — नेहमी, अपवाद नाही.",
    questions: [
      {
        question_en: "Before entering, what must you check first?",
        question_mr: "प्रवेश करण्यापूर्वी, तुम्ही प्रथम काय तपासले पाहिजे?",
        options: [
          { text_en: "Valid entry permit", text_mr: "वैध प्रवेश परवाना", isCorrect: true, feedback_en: "Correct. No permit means no entry.", feedback_mr: "बरोबर. परमिट नाही म्हणजे प्रवेश नाही." },
          { text_en: "Just start entering", text_mr: "फक्त प्रवेश करण्यास सुरुवात करा", isCorrect: false, feedback_en: "Unsafe. Entering without a permit is a critical violation.", feedback_mr: "असुरक्षित. परमिटशिवाय प्रवेश करणे हे गंभीर उल्लंघन आहे." },
          { text_en: "Ask a coworker", text_mr: "सहकाऱ्याला विचारा", isCorrect: false, feedback_en: "Unsafe. You must personally verify the permit.", feedback_mr: "असुरक्षित. तुम्ही स्वतः परमिटची खात्री करणे आवश्यक आहे." }
        ]
      },
      {
        question_en: "How do you know the air inside is safe?",
        question_mr: "आतील हवा सुरक्षित आहे हे तुम्हाला कसे समजेल?",
        options: [
          { text_en: "Test it with a gas detector", text_mr: "गॅस डिटेक्टरने त्याची चाचणी घ्या", isCorrect: true, feedback_en: "Correct. Always rely on calibrated gas monitors.", feedback_mr: "बरोबर. नेहमी कॅलिब्रेट केलेल्या गॅस मॉनिटर्सवर अवलंबून रहा." },
          { text_en: "Smell for gas", text_mr: "गॅसचा वास घ्या", isCorrect: false, feedback_en: "Unsafe. Many toxic gases are odorless and deadly.", feedback_mr: "असुरक्षित. अनेक विषारी वायू गंधहीन आणि प्राणघातक असतात." },
          { text_en: "Assume it's fine", text_mr: "ते ठीक आहे असे समजा", isCorrect: false, feedback_en: "Unsafe. Never assume a confined space is safe.", feedback_mr: "असुरक्षित. कन्फाइन्ड स्पेस सुरक्षित आहे असे कधीही मानू नका." }
        ]
      },
      {
        question_en: "What should be arranged before you go in, in case of emergency?",
        question_mr: "आणीबाणीच्या परिस्थितीत, तुम्ही आत जाण्यापूर्वी काय व्यवस्था केली पाहिजे?",
        options: [
          { text_en: "Rescue equipment and an attendant outside", text_mr: "बाहेर बचाव उपकरणे आणि एक अटेंडंट", isCorrect: true, feedback_en: "Correct. An attendant must always be present outside.", feedback_mr: "बरोबर. बाहेर नेहमी एक अटेंडंट उपस्थित असणे आवश्यक आहे." },
          { text_en: "Nothing, just go in", text_mr: "काहीही नाही, फक्त आत जा", isCorrect: false, feedback_en: "Unsafe. Lack of rescue prep is fatal in emergencies.", feedback_mr: "असुरक्षित. आणीबाणीत बचावाची तयारी नसणे प्राणघातक ठरू शकते." },
          { text_en: "A second worker enters with you", text_mr: "दुसरा कामगार तुमच्यासोबत प्रवेश करतो", isCorrect: false, feedback_en: "Unsafe. That puts two people at risk without outside help.", feedback_mr: "असुरक्षित. यामुळे बाहेरच्या मदतीशिवाय दोन लोकांचा जीव धोक्यात येतो." }
        ]
      }
    ]
  },
  3: {
    id: 3,
    title: "Driving",
    learning_objective_en: "Seatbelt on, phone away, obey site speed limits — every trip.",
    learning_objective_mr: "सीटबेल्ट लावा, फोन दूर ठेवा, साईटच्या वेग मर्यादांचे पालन करा — प्रत्येक प्रवासात.",
    questions: [
      {
        question_en: "Before driving, what's the first thing to do?",
        question_mr: "ड्रायव्हिंग करण्यापूर्वी, प्रथम काय करावे?",
        options: [
          { text_en: "Wear your seatbelt", text_mr: "तुमचा सीटबेल्ट घाला", isCorrect: true, feedback_en: "Correct. Seatbelts save lives.", feedback_mr: "बरोबर. सीटबेल्ट जीव वाचवतात." },
          { text_en: "Check your phone", text_mr: "तुमचा फोन तपासा", isCorrect: false, feedback_en: "Unsafe. Phones cause dangerous distractions.", feedback_mr: "असुरक्षित. फोनमुळे धोकादायक विचलित होऊ शकते." },
          { text_en: "Just start driving", text_mr: "फक्त ड्रायव्हिंग सुरू करा", isCorrect: false, feedback_en: "Unsafe. Always secure yourself before moving.", feedback_mr: "असुरक्षित. हलण्यापूर्वी नेहमी स्वतःला सुरक्षित करा." }
        ]
      },
      {
        question_en: "Your phone rings while driving. What do you do?",
        question_mr: "ड्रायव्हिंग करताना तुमचा फोन वाजतो. तुम्ही काय करता?",
        options: [
          { text_en: "Ignore it / use hands-free", text_mr: "कडे दुर्लक्ष करा / हँड्स-फ्री वापरा", isCorrect: true, feedback_en: "Correct. Keep your hands on the wheel.", feedback_mr: "बरोबर. तुमचे हात स्टीयरिंग व्हीलवर ठेवा." },
          { text_en: "Answer it", text_mr: "उत्तर द्या", isCorrect: false, feedback_en: "Unsafe. Taking calls while driving is strictly prohibited.", feedback_mr: "असुरक्षित. ड्रायव्हिंग करताना कॉल घेणे सक्त मनाई आहे." },
          { text_en: "Read the text", text_mr: "मजकूर वाचा", isCorrect: false, feedback_en: "Unsafe. Looking away from the road can cause fatal crashes.", feedback_mr: "असुरक्षित. रस्त्यावरून लक्ष हटवल्यास प्राणघातक अपघात होऊ शकतात." }
        ]
      }
    ]
  },
  4: {
    id: 4,
    title: "Energy Isolation",
    learning_objective_en: "Isolate, lock, tag, and verify zero energy — before touching anything.",
    learning_objective_mr: "आयसोलेट, लॉक, टॅग आणि शून्य ऊर्जेची खात्री करा — कशालाही स्पर्श करण्यापूर्वी.",
    questions: [
      {
        question_en: "Before maintenance starts, what must be done to the equipment?",
        question_mr: "देखभाल सुरू करण्यापूर्वी, उपकरणांचे काय केले पाहिजे?",
        options: [
          { text_en: "Isolate the energy source and lock it out", text_mr: "ऊर्जा स्त्रोत वेगळा करा आणि तो लॉक करा", isCorrect: true, feedback_en: "Correct. LOTO is mandatory for maintenance.", feedback_mr: "बरोबर. देखभालीसाठी LOTO अनिवार्य आहे." },
          { text_en: "Just turn it off", text_mr: "फक्त ते बंद करा", isCorrect: false, feedback_en: "Unsafe. Switches can be accidentally flipped back on.", feedback_mr: "असुरक्षित. स्विचेस चुकून पुन्हा चालू केले जाऊ शकतात." },
          { text_en: "Start working, it's probably fine", text_mr: "काम सुरू करा, कदाचित ते ठीक आहे", isCorrect: false, feedback_en: "Unsafe. Working on live equipment is deadly.", feedback_mr: "असुरक्षित. जिवंत उपकरणांवर काम करणे प्राणघातक आहे." }
        ]
      },
      {
        question_en: "After locking out, how do you confirm it's actually safe?",
        question_mr: "लॉक आउट केल्यानंतर, ते खरोखर सुरक्षित आहे याची पुष्टी तुम्ही कशी करता?",
        options: [
          { text_en: "Test/verify zero energy", text_mr: "चाचणी/शून्य ऊर्जेची पडताळणी करा", isCorrect: true, feedback_en: "Correct. Always test before you touch.", feedback_mr: "बरोबर. तुम्ही स्पर्श करण्यापूर्वी नेहमी चाचणी करा." },
          { text_en: "Trust the lock", text_mr: "लॉकवर विश्वास ठेवा", isCorrect: false, feedback_en: "Unsafe. Stored energy may still be present in the system.", feedback_mr: "असुरक्षित. साठवलेली ऊर्जा अद्याप सिस्टममध्ये असू शकते." },
          { text_en: "Ask someone else to check", text_mr: "इतर कोणालातरी तपासण्यास सांगा", isCorrect: false, feedback_en: "Unsafe. You must personally verify your own safety.", feedback_mr: "असुरक्षित. तुम्ही स्वतः तुमच्या स्वतःच्या सुरक्षिततेची पडताळणी केली पाहिजे." }
        ]
      }
    ]
  },
  5: {
    id: 5,
    title: "Hot Work",
    learning_objective_en: "Control ignition sources and combustibles before any hot work begins.",
    learning_objective_mr: "कोणतेही हॉट वर्क सुरू होण्यापूर्वी प्रज्वलन स्त्रोत आणि ज्वलनशील पदार्थ नियंत्रित करा.",
    questions: [
      {
        question_en: "Before starting hot work, what should you check?",
        question_mr: "हॉट वर्क सुरू करण्यापूर्वी, तुम्ही काय तपासले पाहिजे?",
        options: [
          { text_en: "Valid hot work permit and clear combustibles", text_mr: "वैध हॉट वर्क परमिट आणि ज्वलनशील पदार्थ साफ करा", isCorrect: true, feedback_en: "Correct. A clean area prevents fires.", feedback_mr: "बरोबर. स्वच्छ परिसर आग टाळतो." },
          { text_en: "Just start welding", text_mr: "फक्त वेल्डिंग सुरू करा", isCorrect: false, feedback_en: "Unsafe. Sparks can easily ignite nearby materials.", feedback_mr: "असुरक्षित. ठिणग्यांमुळे जवळचे साहित्य सहज पेटू शकते." },
          { text_en: "Check only if extinguisher is present", text_mr: "अग्निशामक यंत्र असल्यासच तपासा", isCorrect: false, feedback_en: "Unsafe. You must also remove combustibles and have a permit.", feedback_mr: "असुरक्षित. तुम्ही ज्वलनशील पदार्थ देखील काढून टाकले पाहिजेत आणि परमिट असले पाहिजे." }
        ]
      },
      {
        question_en: "What should be kept ready during the work?",
        question_mr: "कामाच्या वेळी काय तयार ठेवावे?",
        options: [
          { text_en: "Fire extinguisher within reach", text_mr: "अग्निशामक यंत्र आवाक्यात", isCorrect: true, feedback_en: "Correct. Immediate response is critical for hot work fires.", feedback_mr: "बरोबर. हॉट वर्क आगीसाठी त्वरित प्रतिसाद महत्त्वपूर्ण आहे." },
          { text_en: "Nothing extra needed", text_mr: "कोणत्याही अतिरिक्त गोष्टीची आवश्यकता नाही", isCorrect: false, feedback_en: "Unsafe. Fire risks require dedicated suppression equipment.", feedback_mr: "असुरक्षित. आगीच्या धोक्यांसाठी समर्पित दाब उपकरणे आवश्यक असतात." },
          { text_en: "A bucket of water only", text_mr: "फक्त पाण्याची बादली", isCorrect: false, feedback_en: "Unsafe. Water is ineffective and dangerous for chemical or electrical fires.", feedback_mr: "असुरक्षित. पाणी कुचकामी आहे आणि रासायनिक किंवा विद्युत आगीसाठी धोकादायक आहे." }
        ]
      }
    ]
  },
  6: {
    id: 6,
    title: "Line of Fire",
    learning_objective_en: "Never stand in the path of moving or suspended loads/energy.",
    learning_objective_mr: "हलणाऱ्या किंवा निलंबित भारांच्या/ऊर्जेच्या मार्गात कधीही उभे राहू नका.",
    questions: [
      {
        question_en: "Look at your position — are you safe?",
        question_mr: "तुमच्या स्थितीकडे पहा — तुम्ही सुरक्षित आहात का?",
        options: [
          { text_en: "No, I'm under the suspended load", text_mr: "नाही, मी निलंबित भाराखाली आहे", isCorrect: true, feedback_en: "Correct. You are in the line of fire.", feedback_mr: "बरोबर. तुम्ही धोक्याच्या मार्गात आहात." },
          { text_en: "Yes, it's fine", text_mr: "होय, ते ठीक आहे", isCorrect: false, feedback_en: "Unsafe. Standing under a load is a fatal risk.", feedback_mr: "असुरक्षित. भाराखाली उभे राहणे हा प्राणघातक धोका आहे." },
          { text_en: "Not sure", text_mr: "खात्री नाही", isCorrect: false, feedback_en: "Unsafe. Always be aware of hazards above and around you.", feedback_mr: "असुरक्षित. तुमच्या वर आणि आजूबाजूला असलेल्या धोक्यांबद्दल नेहमी जागरूक रहा." }
        ]
      },
      {
        question_en: "Where should you move to?",
        question_mr: "तुम्ही कुठे गेले पाहिजे?",
        options: [
          { text_en: "Outside the marked exclusion zone", text_mr: "चिन्हांकित केलेल्या वगळलेल्या क्षेत्राच्या बाहेर", isCorrect: true, feedback_en: "Correct. Stay entirely clear of the drop zone.", feedback_mr: "बरोबर. ड्रॉप झोनपासून पूर्णपणे दूर रहा." },
          { text_en: "A few steps back only", text_mr: "फक्त काही पावले मागे", isCorrect: false, feedback_en: "Unsafe. The load can swing or bounce if it falls.", feedback_mr: "असुरक्षित. भार पडल्यास तो झुलू शकतो किंवा उसळू शकतो." },
          { text_en: "Stay and watch", text_mr: "थांबा आणि पहा", isCorrect: false, feedback_en: "Unsafe. Watching does not protect you from a falling object.", feedback_mr: "असुरक्षित. पाहण्याने तुमचे पडणाऱ्या वस्तूपासून संरक्षण होत नाही." }
        ]
      }
    ]
  },
  7: {
    id: 7,
    title: "Safe Mechanical Lifting",
    learning_objective_en: "Never walk or stand under a suspended load; stay outside exclusion zones.",
    learning_objective_mr: "निलंबित भाराखाली कधीही चालू किंवा उभे राहू नका; वगळलेल्या क्षेत्राबाहेर रहा.",
    questions: [
      {
        question_en: "Where should you stand during this lift?",
        question_mr: "या लिफ्टच्या वेळी तुम्ही कुठे उभे राहिले पाहिजे?",
        options: [
          { text_en: "Outside the exclusion zone", text_mr: "वगळलेल्या क्षेत्राबाहेर", isCorrect: true, feedback_en: "Correct. Respect the barricades.", feedback_mr: "बरोबर. बॅरिकेड्सचा आदर करा." },
          { text_en: "Near the load to guide it", text_mr: "त्याला मार्गदर्शन करण्यासाठी भाराजवळ", isCorrect: false, feedback_en: "Unsafe. Use tag lines from a distance to guide loads.", feedback_mr: "असुरक्षित. भारांना मार्गदर्शन करण्यासाठी दुरून टॅग लाइन वापरा." },
          { text_en: "Under the load briefly", text_mr: "थोड्या काळासाठी भाराखाली", isCorrect: false, feedback_en: "Unsafe. Never position yourself under a suspended load.", feedback_mr: "असुरक्षित. निलंबित भाराखाली कधीही स्वतःला उभे करू नका." }
        ]
      },
      {
        question_en: "Can you walk underneath the suspended load?",
        question_mr: "तुम्ही निलंबित भाराखाली चालू शकता का?",
        options: [
          { text_en: "No, never", text_mr: "नाही, कधीही नाही", isCorrect: true, feedback_en: "Correct. A falling load is fatal.", feedback_mr: "बरोबर. पडणारा भार प्राणघातक असतो." },
          { text_en: "Yes, quickly", text_mr: "होय, पटकन", isCorrect: false, feedback_en: "Unsafe. Equipment failure happens instantly.", feedback_mr: "असुरक्षित. उपकरणे त्वरित निकामी होतात." },
          { text_en: "Only if it's not moving", text_mr: "फक्त जर ते हलत नसेल", isCorrect: false, feedback_en: "Unsafe. Static loads can still drop if rigging fails.", feedback_mr: "असुरक्षित. रिगिंग निकामी झाल्यास स्थिर भार देखील पडू शकतात." }
        ]
      }
    ]
  },
  8: {
    id: 8,
    title: "Work Authorisation",
    learning_objective_en: "No valid permit, no work — and any change in conditions means stop and recheck.",
    learning_objective_mr: "वैध परमिट नाही, काम नाही — आणि परिस्थितीत कोणताही बदल म्हणजे थांबा आणि पुन्हा तपासा.",
    questions: [
      {
        question_en: "Before starting this task, what must you verify?",
        question_mr: "हे काम सुरू करण्यापूर्वी, तुम्ही काय सत्यापित केले पाहिजे?",
        options: [
          { text_en: "Valid work permit/authorization", text_mr: "वैध वर्क परमिट/ऑथोरायझेशन", isCorrect: true, feedback_en: "Correct. Always confirm your paperwork is signed and current.", feedback_mr: "बरोबर. तुमचे कागदपत्र स्वाक्षरी केलेले आणि चालू असल्याची नेहमी खात्री करा." },
          { text_en: "Just start, it's routine", text_mr: "फक्त सुरू करा, हे नेहमीचे आहे", isCorrect: false, feedback_en: "Unsafe. Even routine tasks require formal authorization.", feedback_mr: "असुरक्षित. अगदी नेहमीच्या कामांसाठीही औपचारिक परवानगी आवश्यक असते." },
          { text_en: "Check with a coworker only", text_mr: "फक्त सहकाऱ्याकडे तपासा", isCorrect: false, feedback_en: "Unsafe. Word of mouth is not a substitute for a signed permit.", feedback_mr: "असुरक्षित. तोंडी सांगणे हा स्वाक्षरी केलेल्या परमिटचा पर्याय नाही." }
        ]
      },
      {
        question_en: "Conditions at the site have changed since the permit was issued. What now?",
        question_mr: "परमिट जारी केल्यापासून साइटवरील परिस्थितीत बदल झाला आहे. आता काय?",
        options: [
          { text_en: "Stop and reassess before continuing", text_mr: "चालू ठेवण्यापूर्वी थांबा आणि पुन्हा मूल्यांकन करा", isCorrect: true, feedback_en: "Correct. Changed conditions void the existing permit.", feedback_mr: "बरोबर. बदललेल्या परिस्थितीमुळे विद्यमान परमिट रद्द होते." },
          { text_en: "Continue, the permit is already signed", text_mr: "चालू ठेवा, परमिटवर आधीच स्वाक्षरी केली आहे", isCorrect: false, feedback_en: "Unsafe. The permit is only valid for the original conditions.", feedback_mr: "असुरक्षित. परमिट केवळ मूळ परिस्थितीसाठी वैध आहे." },
          { text_en: "Finish quickly and report later", text_mr: "पटकन संपवा आणि नंतर कळवा", isCorrect: false, feedback_en: "Unsafe. Working in unassessed conditions is dangerous.", feedback_mr: "असुरक्षित. मूल्यमापन न केलेल्या परिस्थितीत काम करणे धोकादायक आहे." }
        ]
      }
    ]
  },
  9: {
    id: 9,
    title: "Working at Height",
    learning_objective_en: "Harness, rated anchor point, and tool control — every time you work at height.",
    learning_objective_mr: "हार्नेस, रेट केलेले अँकर पॉईंट आणि साधन नियंत्रण — प्रत्येक वेळी जेव्हा तुम्ही उंचीवर काम करता.",
    questions: [
      {
        question_en: "Before climbing, what must you wear?",
        question_mr: "चढण्यापूर्वी, तुम्ही काय घातले पाहिजे?",
        options: [
          { text_en: "A properly fitted harness", text_mr: "योग्यरित्या बसवलेले हार्नेस", isCorrect: true, feedback_en: "Correct. Fall protection starts with a good harness.", feedback_mr: "बरोबर. फॉल प्रोटेक्शन चांगल्या हार्नेसपासून सुरू होते." },
          { text_en: "Just a helmet", text_mr: "फक्त हेल्मेट", isCorrect: false, feedback_en: "Unsafe. A helmet won't stop you from falling.", feedback_mr: "असुरक्षित. हेल्मेट तुम्हाला पडण्यापासून वाचवणार नाही." },
          { text_en: "Nothing extra, be careful", text_mr: "अतिरिक्त काहीही नाही, काळजी घ्या", isCorrect: false, feedback_en: "Unsafe. Careful behavior is not a substitute for PPE.", feedback_mr: "असुरक्षित. सावधगिरीचे वर्तन हा PPE चा पर्याय नाही." }
        ]
      },
      {
        question_en: "Which anchor point should you connect to?",
        question_mr: "तुम्ही कोणत्या अँकर पॉईंटशी कनेक्ट केले पाहिजे?",
        options: [
          { text_en: "The rated, approved anchor point", text_mr: "रेट केलेले, मंजूर अँकर पॉईंट", isCorrect: true, feedback_en: "Correct. Only use engineered tie-off points.", feedback_mr: "बरोबर. फक्त इंजिनिअर केलेल्या टाय-ऑफ पॉइंट्सचा वापर करा." },
          { text_en: "Any nearby pipe or rail", text_mr: "कोणतीही जवळची पाईप किंवा रेल", isCorrect: false, feedback_en: "Unsafe. Handrails and pipes cannot support fall forces.", feedback_mr: "असुरक्षित. हँडरेल्स आणि पाईप्स पडण्याच्या वेगाला आधार देऊ शकत नाहीत." },
          { text_en: "Whichever is closest", text_mr: "जे सर्वात जवळ असेल", isCorrect: false, feedback_en: "Unsafe. Proximity does not equal strength.", feedback_mr: "असुरक्षित. जवळ असणे म्हणजे ताकद नव्हे." }
        ]
      },
      {
        question_en: "What should you do with loose tools?",
        question_mr: "तुम्ही मोकळ्या साधनांचे काय करावे?",
        options: [
          { text_en: "Secure them with a tool lanyard", text_mr: "त्यांना टूल लॅनयार्डने सुरक्षित करा", isCorrect: true, feedback_en: "Correct. Prevent dropped objects.", feedback_mr: "बरोबर. पडणाऱ्या वस्तू टाळा." },
          { text_en: "Keep them in your pocket", text_mr: "त्यांना तुमच्या खिशात ठेवा", isCorrect: false, feedback_en: "Unsafe. Tools can easily fall out of pockets while climbing.", feedback_mr: "असुरक्षित. चढताना साधने खिशातून सहज पडू शकतात." },
          { text_en: "Set them down nearby", text_mr: "त्यांना जवळच खाली ठेवा", isCorrect: false, feedback_en: "Unsafe. Loose tools can be kicked off the platform.", feedback_mr: "असुरक्षित. सैल साधने प्लॅटफॉर्मवरून खाली पडू शकतात." }
        ]
      }
    ]
  },
  10: {
    id: 10,
    title: "H2S / Toxic Gas Emergency Response",
    learning_objective_en: "Check your monitor, move upwind, don your SCBA, and report to the assembly point — in that order.",
    learning_objective_mr: "तुमचा मॉनिटर तपासा, वाऱ्याच्या दिशेने हलवा, तुमचे SCBA घाला आणि असेंब्ली पॉईंटवर कळवा — त्याच क्रमाने.",
    questions: [
      {
        question_en: "Your gas alarm is sounding. What's the first thing to check?",
        question_mr: "तुमचा गॅस अलार्म वाजत आहे. सर्वप्रथम कोणती गोष्ट तपासावी?",
        options: [
          { text_en: "Your personal gas monitor reading", text_mr: "तुमचे वैयक्तिक गॅस मॉनिटर रीडिंग", isCorrect: true, feedback_en: "Correct. Confirm the hazard level immediately.", feedback_mr: "बरोबर. धोक्याची पातळी त्वरित निश्चित करा." },
          { text_en: "Ignore it and keep working", text_mr: "त्याकडे दुर्लक्ष करा आणि काम करत राहा", isCorrect: false, feedback_en: "Unsafe. Never ignore gas alarms.", feedback_mr: "असुरक्षित. गॅस अलार्मकडे कधीही दुर्लक्ष करू नका." },
          { text_en: "Ask a coworker if they heard it too", text_mr: "एखाद्या सहकाऱ्याला विचारा की त्यांनीही ते ऐकले का", isCorrect: false, feedback_en: "Unsafe. Do not delay your response.", feedback_mr: "असुरक्षित. तुमच्या प्रतिसादास विलंब करू नका." }
        ]
      },
      {
        question_en: "The reading confirms H2S. What do you do next?",
        question_mr: "रीडिंग H2S ची पुष्टी करते. तुम्ही पुढे काय करता?",
        options: [
          { text_en: "Move upwind, away from the leak", text_mr: "गळतीपासून दूर, वाऱ्याच्या दिशेने हलवा", isCorrect: true, feedback_en: "Correct. Always evacuate upwind or crosswind.", feedback_mr: "बरोबर. नेहमी वाऱ्याच्या दिशेने किंवा क्रॉसविंडने बाहेर पडा." },
          { text_en: "Move closer to investigate", text_mr: "तपास करण्यासाठी जवळ जा", isCorrect: false, feedback_en: "Unsafe. H2S is deadly and acts quickly.", feedback_mr: "असुरक्षित. H2S प्राणघातक आहे आणि वेगाने कार्य करतो." },
          { text_en: "Wait for instructions", text_mr: "सूचनांची प्रतीक्षा करा", isCorrect: false, feedback_en: "Unsafe. You must self-evacuate immediately.", feedback_mr: "असुरक्षित. तुम्ही त्वरित स्वतःहून बाहेर पडले पाहिजे." }
        ]
      },
      {
        question_en: "What should you put on before going further?",
        question_mr: "पुढे जाण्यापूर्वी तुम्ही काय घातले पाहिजे?",
        options: [
          { text_en: "Escape SCBA / mask", text_mr: "एस्केप SCBA / मास्क", isCorrect: true, feedback_en: "Correct. Protect your lungs.", feedback_mr: "बरोबर. तुमच्या फुफ्फुसांचे रक्षण करा." },
          { text_en: "Just hold your breath", text_mr: "फक्त तुमचा श्वास रोखून धरा", isCorrect: false, feedback_en: "Unsafe. You cannot outrun a gas cloud on one breath.", feedback_mr: "असुरक्षित. एका श्वासात तुम्ही गॅसच्या ढगापासून वाचू शकत नाही." },
          { text_en: "Nothing, just walk fast", text_mr: "काहीही नाही, फक्त वेगाने चाला", isCorrect: false, feedback_en: "Unsafe. You will inhale toxic gas.", feedback_mr: "असुरक्षित. तुम्ही विषारी वायू श्वास घ्याल." }
        ]
      },
      {
        question_en: "Where do you go now?",
        question_mr: "आता तुम्ही कुठे जाता?",
        options: [
          { text_en: "The designated assembly point, and report in", text_mr: "नियुक्त असेंब्ली पॉईंट, आणि नोंद करा", isCorrect: true, feedback_en: "Correct. Headcount is critical in emergencies.", feedback_mr: "बरोबर. आपत्कालीन परिस्थितीत डोके मोजणे महत्त्वाचे आहे." },
          { text_en: "Back to your work area", text_mr: "तुमच्या कार्यक्षेत्रात परत", isCorrect: false, feedback_en: "Unsafe. The area is highly hazardous.", feedback_mr: "असुरक्षित. हा भाग अत्यंत धोकादायक आहे." },
          { text_en: "Stay where you are", text_mr: "तुम्ही जिथे आहात तिथेच रहा", isCorrect: false, feedback_en: "Unsafe. You must proceed to the muster point.", feedback_mr: "असुरक्षित. तुम्ही मस्टर पॉईंटवर गेले पाहिजे." }
        ]
      }
    ]
  }
};
