const scenes = [
  {
    title: "Woh Sapna",
    theme: "dream",
    slides: [
      [
        ["Stage direction", "Stage par andhera. Halki hawa ki awaaz. Diya stage ke centre mein so raha hai."],
        ["Narrator", "Diya ko har raat wahi sapna aata hai. Aaj bhi woh ghabrakar uth baithta hai."],
        ["Diya", "Nahi! Nahi! Mujhe wahan nahi jaana!"],
      ],
      [
        ["Stage direction", "Diya gehri saansein leta hai."],
        ["Maya", "Diya! Kya hua? Phir wahi sapna?", "Room mein aate hue"],
        ["Diya", "Haan... wahi kaala darwaza. Wahi sunsaan registan. Aur woh awaaz..."],
      ],
      [
        ["Maya", "Tumhe roz ek hi sapna aata hai. Shayad tumhara mind tumhe kuch batane ki koshish kar raha hai."],
        ["Diya", "Nahi Maya, yeh sirf sapna nahi hai. Har baar woh awaaz mujhe ek hi jagah bulati hai."],
      ],
      [
        ["Kabir", "Bhai, agar sapne mein koi khazana mil raha hai toh mujhe bhi bata dena. Dosti kis din kaam aayegi?", "Haste hue enter karta hai"],
        ["Maya", "Kabir, please! Yeh mazaak ka time nahi hai."],
        ["Kabir", "Main toh bas mahaul halka kar raha tha."],
      ],
      [
        ["Stage direction", "Zara dheere-dheere stage par aati hai."],
        ["Zara", "Tum log uss jagah ke baare mein baat kar rahe ho?"],
        ["Diya", "Tumhe kaise pata?"],
        ["Zara", "Kyunki maine bhi woh darwaza dekha hai... apne sapne mein."],
      ],
      [
        ["Stage direction", "Sab ek doosre ki taraf dekhte hain."],
        ["Zara", "Aur jo bhi uss darwaze tak gaya hai... woh kabhi pehle jaisa wapas nahi aaya."],
        ["Stage direction", "Lights suddenly off."],
      ],
    ],
  },
  {
    title: "Woh Gaon Jo Nakshe Mein Nahi Hai",
    theme: "village",
    slides: [
      [
        ["Stage direction", "Halki neeli roshni. Hawa aur door se kutto ke rone ki awaaz."],
        ["Narrator", "Diya aur uske saathi ek sunsaan gaon tak pahunchte hain. Yeh wahi jagah hai jo Diya sapne mein dekhta aaya hai."],
        ["Kabir", "Ek minute... hum sach mein iss sunsaan jagah par aa gaye hain? Yahan toh network bhi nahi aa raha!"],
      ],
      [
        ["Maya", "Kabir, tum hi toh keh rahe the ki yahan treasure chhupa hai."],
        ["Kabir", "Haan, lekin maine socha tha treasure ke saath thoda comfort bhi milega!"],
        ["Diya", "Yeh wahi jagah hai jo mujhe sapne mein dikhti thi.", "Ek purane board ko dekhte hue"],
      ],
      [
        ["Maya", "Lekin yeh gaon kisi map par nahi hai. Hum yahan aaye kaise?"],
        ["Zara", "Kuch jagah maps par nahi hoti... woh sirf un logon ko milti hain jinhe wahan aana hota hai."],
        ["Kabir", "Tumhe har baat itni mysterious kyun banani hoti hai?"],
      ],
      [
        ["Stage direction", "Achaanak ek zor ki awaaz aati hai."],
        ["The Keeper", "KYUN AAYE HO TUM LOG YAHAN?"],
        ["Stage direction", "Sab dar kar peeche mudte hain. Keeper dheere-dheere saamne aata hai."],
        ["Maya", "Aap kaun hain?"],
      ],
      [
        ["The Keeper", "Main iss jagah ka rakhwala hoon. Aur tum logon ko yahan nahi aana chahiye tha."],
        ["Diya", "Hum bas ek jawab dhoondhne aaye hain."],
        ["The Keeper", "Har jawab ki ek keemat hoti hai, ladke. Kya tum woh keemat chuka paoge?"],
      ],
    ],
  },
  {
    title: "Rakhwala Ki Chetavani",
    theme: "warning",
    slides: [
      [
        ["Narrator", "Rakhwala unke chaaron taraf dheere-dheere ghoomta hai. Jaise woh jaanta ho ki har koi yahan kyun aaya hai."],
        ["The Keeper", "Tum paanch log yahan apni-apni khwahish lekar aaye ho. Lekin tumhe pata bhi nahi ki tum kis cheez ka peecha kar rahe ho."],
      ],
      [
        ["Kabir", "Dekhiye, mujhe bas khazana chahiye. Baaki philosophy baad mein kar lena."],
        ["The Keeper", "Khazana? Tum jaise logon ne hi iss jagah ko barbaad kiya hai!", "Gusse mein"],
        ["Maya", "Hum kisi ko nuksaan pahunchane nahi aaye."],
      ],
      [
        ["The Keeper", "Har insaan yahi kehta hai. Lekin jab uske saamne uski sabse badi khwahish aati hai, toh woh sab kuch bhool jaata hai."],
        ["Diya", "Woh kaala darwaza kya hai?"],
        ["Stage direction", "Keeper achaanak ruk jaata hai."],
      ],
      [
        ["The Keeper", "Uske baare mein sawaal mat karo."],
        ["Zara", "Lekin mujhe uske peeche jaana hai."],
        ["The Keeper", "Tumhe nahi pata tum kya maang rahi ho."],
      ],
      [
        ["Zara", "Mujhe apni maa se milna hai."],
        ["Stage direction", "Sab Zara ki taraf dekhte hain."],
        ["Zara", "Woh mujhe chhodkar chali gayi thi. Mujhe bas ek baar unse milna hai."],
      ],
      [
        ["The Keeper", "Kuch darwaze khulte nahi... woh tumhe apne andar kheench lete hain."],
        ["Stage direction", "Ek candle apne aap bujh jaati hai."],
      ],
    ],
  },
  {
    title: "Paanch Raaz, Ek Shraap",
    theme: "candles",
    slides: [
      [
        ["Stage direction", "Har character ke saamne ek candle jal rahi hai."],
        ["Narrator", "Ab unke saamne paanch jalti hui candles hain. Rakhwala unke raaz saamne laane wala hai."],
        ["The Keeper", "Iss jagah se zinda nikalna hai toh apne andar ka sach saamne lana hoga. Har candle tumhare ek raaz ko jaanti hai."],
      ],
      [
        ["Maya", "Yeh sab bakwaas hai. Hum yahan se jaa rahe hain."],
        ["The Keeper", "Tum sach se nahi, apni galti se darti ho.", "Maya ki taraf dekhkar"],
        ["Stage direction", "Maya chup ho jaati hai."],
      ],
      [
        ["The Keeper", "Tumne apne ek dost ko tab akela chhod diya tha jab use tumhari zaroorat thi. Aaj tak tum khud ko maaf nahi kar paayi."],
        ["Maya", "Bas karo!"],
        ["Stage direction", "Keeper Kabir ki taraf mudta hai."],
      ],
      [
        ["The Keeper", "Aur tum... tum paison ke liye yahan aaye ho. Lekin tumhe darr hai ki tum apni poori zindagi kuch haasil nahi kar paoge."],
        ["Kabir", "Mujhe bas... ek mauka chahiye tha.", "Dheere se"],
      ],
      [
        ["The Keeper", "Diya... tum apne sapne ke peeche bhaag rahe ho, lekin tumhe khud nahi pata ki tum usse kyun paana chahte ho."],
        ["Diya", "Main apni zindagi ka matlab dhoondhna chahta hoon."],
      ],
      [
        ["The Keeper", "Aur Zara..."],
        ["Stage direction", "Zara ki candle zor se flicker karti hai."],
        ["The Keeper", "Tum apni maa ko wapas chahti ho. Lekin tum jaanti ho ki woh kabhi lautkar nahi aayengi."],
      ],
      [
        ["Zara", "Chup ho jao! Woh yahin hain! Mujhe unki awaaz sunayi deti hai!"],
        ["Stage direction", "Door se ek aurat ki awaaz aati hai."],
        ["Awaaz", "Zara... meri bachchi... mere paas aa jao..."],
      ],
      [
        ["Zara", "Maa?"],
        ["Diya", "Zara! Ruko! Yeh tumhari maa nahi hai!"],
        ["Stage direction", "Zara awaaz ki taraf badhne lagti hai. Keeper zor se hansta hai."],
      ],
      [
        ["The Keeper", "HAHAHA! Sabko wahi sunayi deta hai jo woh sunna chahte hain!"],
        ["Stage direction", "Saari candles ek saath bujh jaati hain."],
      ],
    ],
  },
  {
    title: "Kaala Darwaza",
    theme: "door",
    slides: [
      [
        ["Stage direction", "Dim spotlight. Peeche kaale darwaze ka structure ya shadow dikhayi deta hai."],
        ["Narrator", "Jis darwaze ne Diya ko sapnon mein bulaya tha, ab woh sabke saamne hai."],
        ["Diya", "Yeh wahi darwaza hai... jo mujhe har raat sapne mein dikhta hai."],
      ],
      [
        ["Maya", "Mujhe yahan se jaana hai. Abhi!"],
        ["Kabir", "Haan! Treasure gaya bhaad mein! Mujhe apni jaan pyaari hai!"],
        ["Zara", "Maa... main aa gayi.", "Darwaze ke paas jaate hue"],
      ],
      [
        ["The Keeper", "Darwaza khol do, Zara. Tumhe woh sab mil jayega jo tum chahti ho."],
        ["Diya", "Nahi! Yeh hum sabko phansa raha hai!"],
        ["The Keeper", "Tum sab yahan apni marzi se aaye ho! Kisi ne tumhe majboor nahi kiya!", "Zor se"],
      ],
      [
        ["Maya", "Humne apne darr aur khwahishon ko sach samajh liya."],
        ["Kabir", "Aur maine khazane ke chakkar mein apni jaan daav par laga di."],
      ],
      [
        ["Zara", "Lekin agar main darwaza nahi kholungi toh main apni maa se kabhi nahi mil paungi..."],
        ["Diya", "Kabhi-kabhi kisi ko chhodna hi usse sach mein pyaar karna hota hai."],
        ["Stage direction", "Zara dheere-dheere peeche hat jaati hai."],
      ],
      [
        ["The Keeper", "Nahi! Tum log aisa nahi kar sakte! Darwaza khulna hi chahiye!"],
        ["Stage direction", "Keeper ki awaaz badalne lagti hai. Woh aur khaufnaak ho jaata hai."],
        ["The Keeper", "TUM LOGON NE APNI KISMAT KO CHALLENGE KIYA HAI!"],
        ["Stage direction", "Zor ki hawa ki awaaz. Lights flicker karti hain."],
      ],
    ],
  },
  {
    title: "Aakhri Sach",
    theme: "finale",
    slides: [
      [
        ["Narrator", "Diya zameen par pada ek purana map uthata hai. Shayad iss gaon se nikalne ka raasta usi ke haath mein hai."],
        ["Diya", "Shayad yeh map hi humein yahan laaya tha."],
        ["Maya", "Toh ise khatam kar do!"],
      ],
      [
        ["Stage direction", "Diya map ko phaad deta hai. Achaanak ek tez awaaz hoti hai. Keeper peeche girta hai."],
        ["The Keeper", "Tum samajhte ho ki tum jeet gaye? Tum sirf ek darwaze ko band kar sakte ho... lekin apne andar ke andhere ko nahi!"],
        ["Kabir", "Bas! Ab aur nahi!"],
      ],
      [
        ["Stage direction", "Sab stage ke exit ki taraf bhaagte hain."],
        ["Zara", "Diya! Jaldi aao!"],
        ["Narrator", "Diya peeche mudkar dekhta hai. Keeper ab wahan nahi hai."],
        ["Diya", "Woh... kahan gaya?"],
      ],
      [
        ["Stage direction", "Lights dheere-dheere off hoti hain."],
        ["Maya", "Diya! Tum aa rahe ho na?"],
        ["Stage direction", "Ek second ki khamoshi."],
        ["Diya", "Haan... main aa raha hoon."],
      ],
      [
        ["Stage direction", "Sab exit kar jaate hain. Stage par andhera. Kuch seconds baad Diya akela spotlight mein dikhayi deta hai."],
        ["Unknown Voice", "Tumne darwaza band kar diya... lekin kya tumne apna sapna chhod diya?"],
        ["Diya", "Kaun hai?!"],
      ],
      [
        ["Unknown Voice", "Darwaza ab bhi khula hai..."],
        ["Stage direction", "3–4 seconds ki khamoshi. Phir zor ki knock aur blackout."],
      ],
    ],
  },
];

const closingLines = [
  ["Narrator", "“Sabse bada khatra apni manzil kho dena nahi hai, balki use paane ki zid mein khud ko kho dena hai.”"],
  ["Narrator", "Har sapna poora karna zaroori nahi hota. Kabhi-kabhi humein yeh samajhna padta hai ki hum jis cheez ke peeche bhaag rahe hain, woh sach mein hamare liye sahi bhi hai ya nahi."],
];
