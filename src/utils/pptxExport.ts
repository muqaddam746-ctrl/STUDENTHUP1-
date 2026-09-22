import pptxgen from 'pptxgenjs';
import { AIOrder } from '../types';

export interface SlideContent {
  number: number;
  title: string;
  category?: string;
  subtitle?: string;
  bullets: string[];
  highlightFact?: string;
  speakerNote?: string;
  visualCue?: string;
}

export type PresentationThemeId = 'sapphire' | 'academic' | 'executive' | 'emerald';

export interface ThemeConfig {
  id: PresentationThemeId;
  name: string;
  bg: string;
  cardBg: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  subTextColor: string;
  highlightBg: string;
  highlightText: string;
  borderColor: string;
}

export const PRESENTATION_THEMES: Record<PresentationThemeId, ThemeConfig> = {
  sapphire: {
    id: 'sapphire',
    name: 'Zamonaviy Qorong‘u (Sapphire)',
    bg: '0A1128',
    cardBg: '131E3D',
    titleColor: '38BDF8',
    textColor: 'F1F5F9',
    accentColor: '38BDF8',
    subTextColor: '94A3B8',
    highlightBg: '1E3A8A',
    highlightText: '93C5FD',
    borderColor: '1E293B',
  },
  academic: {
    id: 'academic',
    name: 'Klassik Akademik (Oq)',
    bg: 'F8FAFC',
    cardBg: 'FFFFFF',
    titleColor: '1E3A8A',
    textColor: '1E293B',
    accentColor: '2563EB',
    subTextColor: '475569',
    highlightBg: 'EFF6FF',
    highlightText: '1D4ED8',
    borderColor: 'E2E8F0',
  },
  executive: {
    id: 'executive',
    name: 'Biznes Oltin (Executive)',
    bg: '0F172A',
    cardBg: '1E293B',
    titleColor: 'F59E0B',
    textColor: 'F8FAFC',
    accentColor: 'FBBF24',
    subTextColor: '94A3B8',
    highlightBg: '451A03',
    highlightText: 'FDE68A',
    borderColor: '334155',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Tech (Yashil)',
    bg: '06241B',
    cardBg: '0B3B2D',
    titleColor: '34D399',
    textColor: 'ECFDF5',
    accentColor: '10B981',
    subTextColor: 'A7F3D0',
    highlightBg: '064E3B',
    highlightText: '6EE7B7',
    borderColor: '047857',
  },
};

export async function exportToPowerPoint(
  order: AIOrder,
  slides: SlideContent[],
  themeId: PresentationThemeId = 'sapphire'
): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'StudyHub AI';
  pptx.company = 'StudyHub Academic Platform';
  pptx.title = order.topic || 'Prezentatsiya';

  const theme = PRESENTATION_THEMES[themeId] || PRESENTATION_THEMES.sapphire;

  slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };

    const isFirst = idx === 0;
    const isLast = idx === slides.length - 1;

    // Attach speaker notes for PowerPoint Presenter View
    if (s.speakerNote) {
      slide.addNotes(s.speakerNote);
    }

    if (isFirst) {
      // ===== TITLE SLIDE =====
      // Top badge
      slide.addText('AKADEMIK TAQDIMOT • STUDYHUB', {
        x: 0.8,
        y: 0.8,
        w: '80%',
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: theme.accentColor,
        fontFace: 'Arial',
      });

      // Main title
      slide.addText(s.title, {
        x: 0.8,
        y: 1.4,
        w: '85%',
        h: 1.8,
        fontSize: 32,
        bold: true,
        color: theme.titleColor,
        fontFace: 'Arial',
        valign: 'middle',
      });

      // Subtitle
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8,
          y: 3.3,
          w: '85%',
          h: 0.6,
          fontSize: 16,
          color: theme.subTextColor,
          italic: true,
          fontFace: 'Arial',
        });
      }

      // Metadata card: Presenter, Date, Platform
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 4.2,
        w: 8.4,
        h: 1.1,
        fill: { color: theme.cardBg },
        line: { color: theme.borderColor, width: 1 },
      });

      slide.addText(
        [
          { text: "Ma'ruzachi: ", options: { bold: true, color: theme.accentColor } },
          { text: "Talaba (StudyHub)\n", options: { color: theme.textColor } },
          { text: "Sana: ", options: { bold: true, color: theme.accentColor } },
          { text: `${new Date().toLocaleDateString('uz-UZ')}  •  Jami: ${slides.length} ta slayd`, options: { color: theme.subTextColor } },
        ],
        {
          x: 1.0,
          y: 4.3,
          w: 8.0,
          h: 0.9,
          fontSize: 13,
          fontFace: 'Arial',
        }
      );
    } else if (isLast) {
      // ===== CONCLUSION / Q&A SLIDE =====
      slide.addText('YAKUNIY QISM • XULOSA', {
        x: 0.8,
        y: 0.6,
        w: '80%',
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: theme.accentColor,
        fontFace: 'Arial',
      });

      slide.addText(s.title, {
        x: 0.8,
        y: 1.0,
        w: '85%',
        h: 0.7,
        fontSize: 26,
        bold: true,
        color: theme.titleColor,
        fontFace: 'Arial',
      });

      // Bullet items
      const bulletItems = s.bullets.map((b) => ({
        text: `• ${b}\n`,
        options: {
          fontSize: 14,
          color: theme.textColor,
          breakLine: true,
        },
      }));

      slide.addText(bulletItems, {
        x: 0.8,
        y: 1.8,
        w: '55%',
        h: 3.2,
        fontFace: 'Arial',
        lineSpacing: 24,
      });

      // Big "Thank you" card on the right
      slide.addShape(pptx.ShapeType.rect, {
        x: 6.8,
        y: 1.8,
        w: 5.5,
        h: 3.2,
        fill: { color: theme.cardBg },
        line: { color: theme.borderColor, width: 1 },
      });

      slide.addText("E'tiboringiz uchun\ntashakkur!", {
        x: 7.0,
        y: 2.2,
        w: 5.1,
        h: 1.2,
        fontSize: 24,
        bold: true,
        color: theme.accentColor,
        align: 'center',
        fontFace: 'Arial',
      });

      slide.addText("Savollar va takliflar uchun ochiqman.\nStudyHub Academic AI", {
        x: 7.0,
        y: 3.5,
        w: 5.1,
        h: 0.8,
        fontSize: 13,
        color: theme.subTextColor,
        align: 'center',
        fontFace: 'Arial',
      });
    } else {
      // ===== STANDARD CONTENT SLIDE =====
      // Category tag & slide index
      const catText = s.category ? `${s.category.toUpperCase()}  |  ` : '';
      slide.addText(`${catText}SLAYD ${s.number} / ${slides.length}`, {
        x: 0.8,
        y: 0.5,
        w: '80%',
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: theme.accentColor,
        fontFace: 'Arial',
      });

      // Slide Title
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: '88%',
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: theme.titleColor,
        fontFace: 'Arial',
      });

      // Subtitle if available
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8,
          y: 1.7,
          w: '88%',
          h: 0.4,
          fontSize: 13,
          color: theme.subTextColor,
          italic: true,
          fontFace: 'Arial',
        });
      }

      // Content area
      const startY = s.subtitle ? 2.2 : 1.9;

      // Bullets
      const bulletItems = s.bullets.map((b) => ({
        text: `• ${b}\n`,
        options: {
          fontSize: 14,
          color: theme.textColor,
          breakLine: true,
        },
      }));

      slide.addText(bulletItems, {
        x: 0.8,
        y: startY,
        w: s.highlightFact ? '60%' : '88%',
        h: 3.2,
        fontFace: 'Arial',
        lineSpacing: 22,
      });

      // Highlight fact card (if present)
      if (s.highlightFact) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 7.8,
          y: startY,
          w: 4.5,
          h: 1.6,
          fill: { color: theme.highlightBg },
          line: { color: theme.accentColor, width: 1.5 },
        });

        slide.addText('ASOSIY KO‘RSATKICH', {
          x: 8.0,
          y: startY + 0.15,
          w: 4.1,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: theme.accentColor,
          fontFace: 'Arial',
        });

        slide.addText(s.highlightFact, {
          x: 8.0,
          y: startY + 0.45,
          w: 4.1,
          h: 0.9,
          fontSize: 13,
          bold: true,
          color: theme.highlightText,
          fontFace: 'Arial',
        });
      }

      // Visual recommendation banner at bottom
      if (s.visualCue) {
        slide.addText(`Tavsiya etilgan vizual: ${s.visualCue}`, {
          x: 0.8,
          y: 6.5,
          w: '88%',
          h: 0.4,
          fontSize: 10,
          color: theme.subTextColor,
          italic: true,
          fontFace: 'Arial',
        });
      }
    }
  });

  const cleanTopic = (order.topic || 'prezentatsiya')
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_');
  const fileName = `${cleanTopic}_slaydlar.pptx`;
  await pptx.writeFile({ fileName });
}
