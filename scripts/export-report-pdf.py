"""Қазақ тіліндегі жоба есебін PDF пішіміне сақтау."""
import sys, re, html
from pathlib import Path
sys.path.insert(0, str(Path('.tools/pydeps').resolve()))
sys.stdout.reconfigure(encoding='utf-8')
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parent.parent
fonts=ROOT/'src/fonts'
for name,filename in [('Body','noto-serif-normal-400.ttf'),('BodyBold','noto-serif-normal-500.ttf'),('Sans','noto-sans-normal-400.ttf'),('SansBold','noto-sans-normal-600.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(fonts/filename)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='BodyBold',italic='Body',boldItalic='BodyBold')
ink=HexColor('#2c342d'); muted=HexColor('#7e8175'); copper=HexColor('#9b704e'); line=HexColor('#d9dece')
styles={
    'body':ParagraphStyle('body',fontName='Body',fontSize=10.2,leading=16.5,textColor=ink,alignment=TA_JUSTIFY,spaceAfter=9,allowWidows=0,allowOrphans=0),
    'heading':ParagraphStyle('heading',fontName='SansBold',fontSize=13.1,leading=19,textColor=ink,spaceBefore=15,spaceAfter=9,keepWithNext=True),
    'title':ParagraphStyle('title',fontName='BodyBold',fontSize=23,leading=31,textColor=ink,spaceAfter=15,keepWithNext=True),
    'subtitle':ParagraphStyle('subtitle',fontName='Sans',fontSize=10,leading=16,textColor=copper,spaceAfter=18,keepWithNext=True),
    'list':ParagraphStyle('list',fontName='Body',fontSize=10.2,leading=16.5,textColor=ink,leftIndent=15,firstLineIndent=0,bulletIndent=0,bulletFontName='Sans',bulletFontSize=9,spaceAfter=5),
    'code':ParagraphStyle('code',fontName='Sans',fontSize=9,leading=15,textColor=ink,backColor=HexColor('#f0f2eb'),borderPadding=12,spaceBefore=7,spaceAfter=12,leftIndent=12,rightIndent=12),
    'cell':ParagraphStyle('cell',fontName='Sans',fontSize=8.2,leading=12.5,textColor=ink),
    'th':ParagraphStyle('th',fontName='SansBold',fontSize=8.4,leading=13,textColor=white),
}
def inline(text):
    text=html.escape(text)
    text=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'<link href="\2" color="#8b6043"><u>\1</u></link>',text)
    text=re.sub(r'`([^`]+)`',r'<font name="Sans" size="9">\1</font>',text)
    text=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',text)
    return text

source=(ROOT/'docs/Жобаны әзірлеу туралы есеп.md').read_text(encoding='utf-8')
source=source.replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
source=source.replace('→','->')
rows=source.splitlines(); story=[]; i=0
while i<len(rows):
    row=rows[i].strip()
    if not row: i+=1;continue
    if row.startswith('# '):
        story.append(Paragraph('«Қаныш және ғылыми майдан»',styles['title']))
        story.append(Paragraph('ИНТЕРАКТИВТІ КІТАП-САЙТТЫ ӘЗІРЛЕУ ТУРАЛЫ ЕСЕП',styles['subtitle']))
        i+=1;continue
    if row.startswith('## '): story.append(Paragraph(inline(row[3:]),styles['heading']));i+=1;continue
    if row.startswith('```'):
        code=[];i+=1
        while i<len(rows) and not rows[i].startswith('```'):code.append(rows[i]);i+=1
        story.append(Preformatted('\n'.join(code),styles['code']));i+=1;continue
    if row.startswith('|'):
        table_rows=[]
        while i<len(rows) and rows[i].strip().startswith('|'):
            cells=[c.strip() for c in rows[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-+:?',c) for c in cells):table_rows.append(cells)
            i+=1
        data=[[Paragraph(inline(c),styles['th'] if n==0 else styles['cell']) for c in cells] for n,cells in enumerate(table_rows)]
        table=Table(data,colWidths=[104,145,236.27],repeatRows=1,hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#344439')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),('LINEBELOW',(0,1),(-1,-1),.5,line),('ROWBACKGROUNDS',(0,1),(-1,-1),[HexColor('#f4f5f0'),white])]))
        story.extend([table,Spacer(1,12)]);continue
    match=re.match(r'^(\d+)\.\s+(.*)',row)
    if row.startswith('- ') or match:
        label='•' if row.startswith('- ') else match.group(1)+'.'
        content=row[2:] if row.startswith('- ') else match.group(2)
        story.append(Paragraph(inline(content),styles['list'],bulletText=label));i+=1;continue
    paragraph=[row];i+=1
    while i<len(rows) and rows[i].strip() and not re.match(r'^(#|\||```|- |\d+\. )',rows[i].strip()):paragraph.append(rows[i].strip());i+=1
    text=' '.join(paragraph)
    paragraph_style=ParagraphStyle('intro',parent=styles['body'],keepWithNext=True) if text.endswith(':') else styles['body']
    story.append(Paragraph(inline(text),paragraph_style))

target=ROOT/'output/pdf/Қаныш және ғылыми майдан - жоба есебі.pdf'
target.parent.mkdir(parents=True,exist_ok=True)
def page_frame(c,doc):
    c.saveState();w,h=A4
    c.setStrokeColor(line);c.setLineWidth(.6);c.line(55,h-40,w-55,h-40);c.line(55,43,w-55,43)
    c.setFont('Sans',7);c.setFillColor(muted);c.drawString(55,h-29,'ҚАНЫШ ЖӘНЕ ҒЫЛЫМИ МАЙДАН')
    c.drawRightString(w-55,h-29,'ЖОБА ҚҰЖАТТАМАСЫ')
    c.drawString(55,28,'Жобаны әзірлеу туралы есеп');c.setFont('SansBold',8);c.drawRightString(w-55,28,str(doc.page))
    c.restoreState()
doc=SimpleDocTemplate(str(target),pagesize=A4,rightMargin=55,leftMargin=55,topMargin=60,bottomMargin=59,title='Қаныш және ғылыми майдан: жобаны әзірлеу туралы есеп',author='Жоба авторы',subject='Интерактивті кітап-сайтты әзірлеу туралы қазақ тіліндегі есеп')
doc.build(story,onFirstPage=page_frame,onLaterPages=page_frame)
pdf=PdfReader(str(target));text='\n'.join(p.extract_text() for p in pdf.pages)
assert all(word in text for word in ['Қаныш','Тарихи сәтті','Қызылорда','GitHub','14']), 'Мәтін тексеру қатесі'
assert '\ufffd' not in text
assert '\x00' not in text
print('PDF:',target)
print('Бет саны:',len(pdf.pages))
print('Мәтін таңбалары:',len(text))
