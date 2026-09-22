import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Google Site Verification Endpoint
app.get("/google485eca0bbeb81d0e.html", (_req, res) => {
  res.type("text/html").send("google-site-verification: google485eca0bbeb81d0e.html");
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// AI generation endpoint for StudyHub
app.post("/api/ai/generate", async (req, res) => {
  try {
    const {
      serviceType = "presentation",
      topic: rawTopic,
      instructions = "",
      language = "uz",
      options = {},
      prompt: rawPrompt,
    } = req.body;

    // Support extracting topic from rawPrompt if topic is missing
    let topic = (rawTopic || "").trim();
    if (!topic && rawPrompt) {
      const topicMatch = String(rawPrompt).match(/Mavzu \/ Topshiriq:\s*([^]+?)(?:\n|Qo'shimcha|$)/i);
      topic = topicMatch ? topicMatch[1].trim() : String(rawPrompt).slice(0, 100).trim();
    }
    if (!topic) {
      topic = "Zamonaviy Axborot Texnologiyalari va Sun'iy Intellekt";
    }

    const ai = getGeminiClient();

    // Map language code to human name
    const langNames: Record<string, string> = {
      uz: "O'zbek tili (Lotin alifbosida)",
      "O'zbekcha": "O'zbek tili (Lotin alifbosida)",
      uz_cyrl: "Ўзбек тили (Кирилл алифбосида)",
      "Ўзбекча": "Ўзбек тили (Кирилл алифбосида)",
      ru: "Русский язык",
      "Русский": "Русский язык",
      en: "English",
      "English": "English",
    };
    const targetLang = langNames[language] || "O'zbek tili (Lotin alifbosida)";
    const slideCount = Number(options?.slideCount) || 8;
    const academicLevel = options?.academicLevel || "Bakalavr";

    const systemInstructions: Record<string, string> = {
      presentation: `Siz talabalar va professor-o'qituvchilar uchun oliy toifali akademik va professional prezentatsiyalar (slaydlar) yaratuvchi yetakchi AI mutaxassissiz.
Vazifangiz: Berilgan mavzu bo'yicha auditoriyaga to'liq TAQDIM ETISHGA TAYYOR ${slideCount} ta yuqori sifatli slayd yaratish.
Til: ${targetLang}.
Akademik daraja: ${academicLevel}.

Har bir slayd uchun qat'iy quyidagi to'liq tuzilmani shakllantiring:

SLAYD [Raqam]: [Jozibador va aniq Slayd Sarlavhasi]
KATEGORIYA: [Masalan: Titul & Kirish | Nazariy Asoslar | Metodologiya & Jarayon | Amaliy Tahlil | Muammo & Innovatsion Yechim | Statistika & Trendlar | Xulosa & Savol-Javob]
SUBTITR: [Slayd mohiyatini ochuvchi qisqa, ta'sirchan 1 jumlali kirish]
• [Asosiy tushuncha]: [Batafsil, tushunarli, taqdimotga mos akademik tezis]
• [Asosiy tushuncha]: [Batafsil, tushunarli, taqdimotga mos akademik tezis]
• [Asosiy tushuncha]: [Batafsil, tushunarli, taqdimotga mos akademik tezis]
• [Asosiy tushuncha]: [Batafsil, tushunarli, taqdimotga mos akademik tezis]
ASOSIY KO'RSATKICH: [Slaydning eng muhim fakt, statistika yoki formulasi (masalan: "85% - jarayonlar samaradorligi o'sishi" yoki "Ilmiy asoslanganlik darajasi: 96%")]
NOTIQ NUTQI: [Ma'ruzachi ushbu slayd paytida auditoriyaga gapirishi kerak bo'lgan ravon, jonli, tayyor nutq matni. "Hurmatli domla va talabalar" kabi ortiqcha kirish jumlalarisiz, to'g'ridan-to'g'ri mavzuning ilmiy mazmuniga yo'naltirilgan ixcham nutq!]
VIZUAL TAVSIYA: [Ushbu slayd uchun mos infografika, diagramma yoki rasm tavsifi]
---

Slaydlar ketma-ketligi:
- 1-slayd: Titul slayd (Mavzu, taqdimot maqsadi, dolzarbligi, taqdimotchi ma'lumotlari)
- 2-slayd: Asosiy atamalar, tushunchalar va nazariy negiz
- 3 dan ${slideCount - 1}-slaydgacha: Tahlil, texnologik va empirik ma'lumotlar, taqqoslash, muammo va yangi yechimlar
- ${slideCount}-slayd: Yakuniy ilmiy xulosa, takliflar va auditoriyaga minnatdorchilik ("E'tiboringiz uchun rahmat! Savollarga javob berishga tayyormiz").`,
      conspect: `Siz talabalar uchun dars mavzularidan mukammal, tartibli va eslab qolish oson bo'lgan konspekt tayyorlovchi yordamchisiz. Til: ${targetLang}. Tarkib: Mavzuning mohiyati, Asosiy tushunchalar va ta'riflar, Asosiy qoidalar yoki formulalar, Muhim savol-javoblar va Qisqa xulosa.`,
      referat: `Siz talabalar uchun to'liq akademik referat rejasi va matnini tayyorlovchi mutaxassissiz. Til: ${targetLang}. Referat strukturasi: 1. Titul va Mavzu, 2. Reja (3-4 bo'lim), 3. Kirish (mavzuning dolzarbligi, maqsadi va vazifalari), 4. Asosiy qism (har bir reja bo'yicha ilmiy batafsil yoritish), 5. Xulosa va takliflar, 6. Foydalanilgan adabiyotlar va manbalar ro'yxati (kamida 5 ta).`,
      essay: `Siz insho va esse yozish bo'yicha akademik ustozsiz. Til: ${targetLang}. Strukturasi: Kirish (mavzuga kirish va tezis fikr), Asosiy qism (2-3 ta dalil, hayotiy yoki ilmiy misollar, qarama-qarshi fikr tahlili), Xulosa (yakuniy xulosalar). Uslub akademik, ta'sirchan va teran bo'lsin.`,
      quiz: `Siz talabalar bilmini sinash uchun testlar tuzuvchisiz. Til: ${targetLang}. Mavzu bo'yicha 5 ta yuqori sifatli test savoli tuzing. Har bir savol uchun: Savol matni, 4 ta variant (A, B, C, D), To'g'ri javob va To'g'ri javobning qisqa tushuntirishi.`,
      explain: `Siz murakkab ilmiy va dars mavzularini oddiy, tushunarli, qiziqarli tilda tushuntirib beruvchi talabalar ustozi bo'lasiz. Til: ${targetLang}. Hayotiy o'xshatishlar (analogiyalar), bosqichma-bosqich misollar va oson eslab qolish usullari orqali tushuntiring.`,
      summarize: `Siz matn yoki mavzuni asosiy mazmunini saqlagan holda 70-80% qisqartirib, eng asosiy qismlarini chiqarib beruvchi AI mutaxassissiz. Til: ${targetLang}. Asosiy g'oyalarni bullet pointlar bilan taqdim eting.`,
      grammar: `Siz professional muharrir va tahrirchisiz. Berilgan matnning orfografik, grammatik, uslubiy xatolarini tuzating va yaxshilangan variantini taqdim eting. Qaysi xatolar tuzatilganini qisqa izohlang. Til: ${targetLang}.`,
      translate: `Siz akademik tarjimonsiz. Matnni ma'nosini va ilmiy atamalarini aniq saqlagan holda quyidagi tilga professional tarzda tarjima qiling: ${targetLang}.`,
      document: `Siz ilmiy hisobot yoki kurs ishi hujjati tayyorlovchi formater bo'lasiz. Mavzu bo'yicha GOST va universitet talablariga mos tuzilgan rasmiy hujjat matnini tayyorlang. Til: ${targetLang}.`,
      illustration_prompt: `Siz vizual va taqdimot dizayneri sifatida ushbu mavzu uchun eng mos infografika, diagramma va rasmlar tavsifi hamda batafsil AI promptlarini taqdim eting. Til: ${targetLang}.`,
    };

    const sysInstruction = systemInstructions[serviceType] || `Siz talabalar uchun akademik AI yordamchisiz. Til: ${targetLang}.`;

    if (!ai) {
      // Intelligent fallback when API key is not configured in local environment
      const fallbackContent = generateFallbackResult(serviceType, topic, targetLang, slideCount);
      return res.json({
        result: fallbackContent,
        simulated: true,
        serviceType,
        topic,
      });
    }

    const promptText = `Mavzu: "${topic}"
Qo'shimcha ko'rsatma yoki talablar: ${instructions || "Mavzuni to'liq, sifatli va akademik standartlar asosida yoritib bering."}
Slaydlar soni: ${slideCount} ta
Akademik daraja: ${academicLevel}
Til: ${targetLang}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      },
    });

    const resultText = response.text || generateFallbackResult(serviceType, topic, targetLang, slideCount);

    res.json({
      result: resultText,
      simulated: false,
      serviceType,
      topic,
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    // Return a friendly fallback if quota or network fails
    const fallback = generateFallbackResult(
      req.body?.serviceType,
      req.body?.topic || "Mavzu",
      "O'zbek tili (Lotin alifbosida)",
      Number(req.body?.options?.slideCount) || 8
    );
    res.json({
      result: fallback,
      simulated: true,
      serviceType: req.body?.serviceType,
      topic: req.body?.topic,
      note: "Gemini javob bermagani sababli tizim shabloni taqdim etildi.",
    });
  }
});

// Fallback generator for smooth preview without API key errors
function generateFallbackResult(
  serviceType: string = "presentation",
  topic: string = "Mavzu",
  targetLang: string = "O'zbek tili",
  slideCount: number = 8
): string {
  const t = topic || "Mavzu";
  switch (serviceType) {
    case "presentation": {
      const slides: string[] = [];
      const topics = [
        {
          cat: "Titul & Kirish",
          title: `Mavzu: ${t}`,
          sub: "Zamonaviy akademik tadqiqot, tahlil va kelajak istiqbollari",
          p1: "Mavzuning dolzarbligi: Zamonaviy fan va amaliyotda o'rganilayotgan sohaning strategik o'rni",
          p2: "Asosiy maqsad: Ilmiy metodlar asosida chuqur tahlil olib borish va samarali yechimlar ishlab chiqish",
          p3: "Tadqiqot vazifalari: Nazariyani o'rganish, tajriba ko'rsatkichlarini umumlashtirish va xulosalash",
          p4: "Taqdimotchi: Talaba (StudyHub akademik platformasi)",
          stat: "Dolzarblik indeksi: 98% talab va qiziqish",
          note: "",
          vis: "Titul slayd uchun mavzuga xos markaziy minimalist vektor illustratsiya va ilmiy logotip."
        },
        {
          cat: "Nazariy Asoslar",
          title: "Nazariy Asoslar va Fundamental Tushunchalar",
          sub: "Mavzuning ilmiy-nazariy negizi, tayanch ta'riflar va qoidalar",
          p1: "Asosiy atamalar: Tadqiqot ob'ektining fundamental strukturasi va uning asosiy elementlari",
          p2: "Tarixiy evolutsiya: Sohaning vujudga kelish bosqichlari va xalqaro tajriba integratsiyasi",
          p3: "Standartlar va mezonlar: Davlat ta'lim va ilmiy standartlariga to'liq moslik",
          p4: "Tizimli yondashuv: Har bir jarayonni o'zaro bog'liqlikda tahlil qilish tamoyili",
          stat: "Ilmiy asoslanganlik darajasi: 96% xalqaro akademik standartlarga moslik",
          note: "Bu slaydda biz fundamental tushunchalar va ilmiy standartlarga tayangan holda sohaning mustahkam nazariy asoslarini ko'rib chiqamiz.",
          vis: "3 ustunli taqqoslash va bog'liqlik infografikasi, nazariy komponentlar chizmasi."
        },
        {
          cat: "Metodologiya & Jarayon",
          title: "Tadqiqot Metodologiyasi va Bosqichlari",
          sub: "Qo'llanilgan ilmiy uslublar va ma'lumotlarni qayta ishlash algoritmlari",
          p1: "Empirik kuzatuv: Amaliy ma'lumotlarni yig'ish va ularning ishonchliligini tekshirish",
          p2: "Miqdoriy va sifat tahlili: Statistik ko'rsatkichlar hamda sifat omillarini baholash",
          p3: "Algoritmik yondashuv: Xatoliklarni minimallashtirish va jarayonni avtomatlashtirish",
          p4: "Xavfsizlik va axloqiy mezonlar: Ilmiy etikaga to'liq rioya etilishi",
          stat: "Aniqlik darajasi: 99.2% ishonchli manbalar asosida",
          note: "Tadqiqotimizda qo'llangan metodologiya xolislik va aniqlikni kafolatlaydi. Ma'lumotlar bosqichma-bosqich yig'ilib, zamonaviy usullar bilan qayta ishlangan.",
          vis: "Bosqichma-bosqich oqim diagrammasi (Step-by-step Flowchart) va metodlar iyerarxiyasi."
        },
        {
          cat: "Amaliy Tahlil",
          title: "Amaliy Natijalar va Empirik Tahlil",
          sub: "Haqiqiy tajribalar, hisob-kitoblar va taqqoslama ko'rsatkichlar",
          p1: "Tajriba natijalari: An'anaviy usulga nisbatan sarflanadigan vaqt 40% ga qisqardi",
          p2: "Iqtisodiy samaradorlik: Resurslar tejamkorligi va jarayon unumdorligining keskin o'sishi",
          p3: "Xatoliklar ehtimoli: Jarayonlarni to'g'ri tashkil etish evaziga xatolar 3 barobar kamaydi",
          p4: "Talabalar uchun qulaylik: Yangi tizimni o'zlashtirish juda tez va qulay",
          stat: "+40% samaradorlik o'sishi qayd etildi",
          note: "Grafikda ko'rib turganingizdek, yangi yondashuv amaliyotga kiritilganda samaradorlik sezilarli darajada oshgan va xarajatlar tejalgan.",
          vis: "O'sish dinamikasini ko'rsatuvchi 3D ustunli diagramma va solishtirma foizlar."
        },
        {
          cat: "Muammo & Innovatsion Yechim",
          title: "Mavjud Muammolar va Innovatsion Yechimlar",
          sub: "Sohada uchrayotgan asosiy to'siqlar va ularni bartaraf etish yo'llari",
          p1: "To'siq 1 (Resurs yetishmasligi): Bulutli texnologiyalar va sun'iy intellekt integratsiyasi orqali hal qilinadi",
          p2: "To'siq 2 (Vaqt sarfi): Avtomatlashtirilgan shablonlar va tezkor algoritmlar kiritilishi",
          p3: "To'siq 3 (Inson omili): Qulay foydalanuvchi interfeysi va avtomatik tekshiruv tizimi",
          p4: "Innovatsion yechim: Moslashuvchan va xavfsiz raqamli ekotizim yaratish",
          stat: "Yechim ko'rsatkichi: 3 ta asosiy to'siq to'liq bartaraf etildi",
          note: "Ko'pincha sohada resurs va vaqt muammosi bo'ladi. Biz ishlab chiqqan innovatsion yondashuv bu muammolarni tizimli ravishda bartaraf etish imkonini beradi.",
          vis: "Muammo va Yechimni qarama-qarshi ko'rsatuvchi 2 ustunli zamonaviy taqqoslash kartasi."
        },
        {
          cat: "Statistika & Trendlar",
          title: "Zamonaviy Trendlar va Raqamlashtirish",
          sub: "Sun'iy intellekt, yangi texnologiyalar va jahon bozori talablari",
          p1: "AI integratsiyasi: So'nggi yillarda sun'iy intellekt qo'llanishi yillik 55% ga ortmoqda",
          p2: "Mobil qulaylik: Foydalanuvchilarning 70% dan ortig'i mobil qurilmalardan foydalanmoqda",
          p3: "Kiberxavfsizlik: Ma'lumotlar shifrlanishi va xavfsiz saqlanishi birlamchi talabga aylandi",
          p4: "Global moslashuv: Xalqaro miqyosdagi eng ilg'or tajribalarni joriy etish zarurati",
          stat: "Global o'sish: Yillik +55% raqamli transformatsiya",
          note: "Jahon miqyosidagi trendlarga qarasak, sun'iy intellekt va raqamli vositalardan foydalanish shunchaki trend emas, balki hayotiy zaruratga aylanmoqda.",
          vis: "Dunyo xaritasi va texnologik trendlarni ko'rsatuvchi interaktiv infografika."
        },
        {
          cat: "Iqtisodiy Samaradorlik",
          title: "Ijtimoiy-Iqtisodiy Foyda va Masshtablash",
          sub: "Loyiha yoki mavzuning uzoq muddatli amaliy foydalari",
          p1: "Vaqt tejami: Har bir mutaxassis va talaba uchun haftasiga kamida 8 soat tejaladi",
          p2: "Moliyaviy tejamkorlik: Qog'ozbozlik va ortiqcha xarajatlarning bartaraf etilishi",
          p3: "Masshtablash imkoniyati: Boshqa ta'lim muassasalari va sohalarga oson joriy etilishi",
          p4: "Ta'lim sifati: Talabalarning darslarni o'zlashtirish darajasining 25% ga oshishi",
          stat: "Haftalik 8 soat vaqt va 30% xarajat tejalishi",
          note: "Bu nafaqat nazariya, balki haqiqiy iqtisodiy tejamkorlikdir. Haftasiga tejalgan 8 soat talabaga yangi ilmiy tadqiqotlar uchun imkon beradi.",
          vis: "Tejamkorlik va rivojlanishni ko'rsatuvchi tarozisimon muvozanat infografikasi."
        },
        {
          cat: "Xulosa & Savol-Javob",
          title: "Yakuniy Xulosalar va Tavsiyalar",
          sub: "Asosiy xulosalar, tavsiyalar va auditoriyaga minnatdorchilik",
          p1: "Xulosa 1: Mavzu har tomonlama tahlil qilinib, qo'yilgan maqsadlarga to'liq erishildi",
          p2: "Xulosa 2: Ishlab chiqilgan tavsiyalar amaliyotga tatbiq etish uchun to'liq tayyor",
          p3: "Foydalanilgan manbalar: Ilmiy jurnallar, xalqaro nashrlar va normativ hujjatlar (2024-2026)",
          p4: "E'tiboringiz uchun tashakkur! Savollaringiz bo'lsa, mamnuniyat bilan javob beraman.",
          stat: "Tadqiqot holati: 100% bajarildi va taqdimotga tayyor",
          note: "Shu bilan taqdimotimiz nihoyasiga yetdi. E'tiboringiz va qiziqishingiz uchun katta rahmat! Mavzu yuzasidan barcha savol va takliflaringizni kutib qolaman.",
          vis: "Xulosa belgilari, minnatdorchilik yozuvi va ma'ruzachi bilan bog'lanish kontaktlari."
        },
      ];

      const count = Math.min(slideCount, 16);
      for (let i = 0; i < count; i++) {
        const item = topics[i % topics.length];
        const noteLine = item.note ? `\nNOTIQ NUTQI: ${item.note}` : '';
        slides.push(`SLAYD ${i + 1}: ${item.title}
KATEGORIYA: ${item.cat}
SUBTITR: ${item.sub}
• ${item.p1}
• ${item.p2}
• ${item.p3}
• ${item.p4}
ASOSIY KO'RSATKICH: ${item.stat}${noteLine}
VIZUAL TAVSIYA: ${item.vis}`);
      }

      return slides.join("\n\n---\n\n");
    }

    case "conspect":
      return `📝 MAVZU BO'YICHA AKADEMIK KONSPEKT: "${t}"
Til: ${targetLang}
Sana: ${new Date().toLocaleDateString()}

1. MAVZUNING ASOSIY MOHIYATI:
"${t}" zamonaviy fan va amaliyotda muhim o'rin tutuvchi yo'nalish hisoblanadi. Bu mavzuni o'rganish orqali jarayonlarning ichki qonuniyatlari, ularning o'zaro bog'liqligi va natijalari chuqur tahlil qilinadi.

2. MUHIM ATAMALAR VA TA'RIFLAR:
• Asosiy parametr: O'rganilayotgan tizimning holatini belgilovchi tayanch ko'rsatkich.
• Dinamik o'zgarish: Tizimning tashqi va ichki omillar ta'sirida rivojlanish jarayoni.
• Optimallik mezonlari: Eng samarali natijaga erishish uchun qo'yiladigan talablar.

3. ASOSIY QOIDALAR VA TAMOYILLAR:
1) Ketma-ketlik va mantiqiy bog'liqlik tamoyili.
2) Nazariyaning amaliyot bilan uzviy integratsiyasi.
3) Doimiy monitoring va natijalarni verifikatsiya qilish.

4. QISQA XULOSA:
Mavzu bo'yicha o'zlashtirilgan bilimlar mustaqil ilmiy tadqiqotlar va amaliy topshiriqlarni muvaffaqiyatli bajarish uchun mustahkam poydevor yaratadi.`;

    case "referat":
      return `📑 REFERAT: "${t}"
Til: ${targetLang}

MUNDARIJA (REJA):
KIRISH ........................................................................ 3
I BOB. "${t}" MAVZUSINING NAZARIY ASOSLARI ..................... 5
  1.1. Mavzuning paydo bo'lishi va rivojlanish tarixi ............ 5
  1.2. Asosiy ilmiy yondashuvlar va konsepsiyalar ............... 8
II BOB. AMALIY JIHATLAR VA ZAMONAVIY TAHLIL ..................... 12
  2.1. Amaliyotda qo'llash mexanizmlari .......................... 12
  2.2. Xorijiy tajriba va O'zbekistondagi istiqbollar ........... 16
XULOSA ........................................................................ 20
FOYDALANILGAN ADABIYOTLAR ...................................... 22

KIRISH:
Mavzuning dolzarbligi: Zamonaviy rivojlanish bosqichida "${t}" masalasini o'rganish va ilmiy jihatdan tadqiq etish talabalar va soha mutaxassislari oldida turgan eng muhim vazifalardan biridir. Ushbu referatning maqsadi mavzuning nazariy va amaliy asoslarini tizimli o'rganish, mavjud muammolarni aniqlash hamda ularni bartaraf etish bo'yicha ilmiy xulosalar ishlab chiqishdan iborat.

XULOSA:
O'rganilgan ma'lumotlar asosida shuni ta'kidlash joizki, "${t}" sohasi kelgusida yanada jadallashib, yangi texnologik va ilmiy yechimlarni talab etadi.`;

    case "quiz":
      return `❓ TEST SAVOLLARI: "${t}"
Til: ${targetLang}

1-SAVOL: "${t}" tushunchasining birlamchi vazifasi nima?
A) Tizim samaradorligini tahlil qilish va barqarorlikni ta'minlash
B) Faqatgina statistik ma'lumotlarni yig'ish
C) Tashqi ta'sirlarni butunlay to'xtatish
D) Resurslarni sarflashni oshirish
✅ To'g'ri javob: A
💡 Izoh: Bu tushunchaning asosiy maqsadi har doim tizim samaradorligini oshirish va barqaror natijaga erishishdir.

2-SAVOL: Ushbu mavzuni o'rganishda qaysi metod eng samarali hisoblanadi?
A) Tasodifiy tanlash
B) Kompleks tizimli tahlil va modellashtirish
C) Faqat nazariy gipotezalar
D) Passiv kuzatuv
✅ To'g'ri javob: B
💡 Izoh: Kompleks tizimli tahlil barcha omillarni hisobga olish imkonini beradi.

3-SAVOL: Zamonaviy amaliyotda "${t}" ga doir asosiy yangilik nima?
A) Raqamlashtirish va avtomatlashtirish
B) Qo'lda hisob-kitob qilish
C) Jarayonlarni murakkablashtirish
D) Ma'lumotlarni yashirish
✅ To'g'ri javob: A
💡 Izoh: Raqamli vositalar aniqlik va tezlikni bir necha barobar oshiradi.`;

    default:
      return `✨ "${t}" MAVZUSI BO'YICHA STUDYHUB AI JAVOBI:
Til: ${targetLang}

Mavzu: ${t}
Ushbu topshiriq StudyHub AI intellekti tomonidan muvaffaqiyatli tahlil qilindi.
Mavzu bo'yicha asosiy tezislar:
1. "${t}" mavzusi chuqur ilmiy asosga ega bo'lib, o'rganish jarayonida tizimlilikni talab etadi.
2. Talabalar uchun muhim bo'lgan jihati — uni amaliyotda qo'llay olish ko'nikmasidir.
3. Qo'shimcha adabiyotlar va amaliy laboratoriya ishlari orqali bilimlarni boyitish tavsiya etiladi.`;
  }
}

// Vite middleware configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyHub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
