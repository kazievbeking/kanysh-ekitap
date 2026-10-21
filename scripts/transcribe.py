"""Аудиодағы көрініс шекараларын анықтауға арналған көмекші."""
import sys, json
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path('.tools/pydeps').resolve()))
from faster_whisper import WhisperModel
model = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=8, download_root='.cache/whisper')
for chapter in (1, 2):
    target = Path(f'materials/audio-{chapter}-timings.json')
    if target.exists() and json.loads(target.read_text(encoding='utf-8')).get('complete'):
        continue
    prompt='Қаныш Сәтбаев. Ғылым академиясы. Мұхтар Әуезов, Әлкей Марғұлан, Ахмет Жұбанов, Бейсенбай Кенжебаев, Есмағамбет Ысмайылов, Қажым Жұмалиев. Нұртас Оңдасынов. Жұмабай Шаяхметов. Шапық Шөкин. Нечитало. Таисия. Аяпбергенов. Долгополов. Қызылорда, Орал, Қазан, Мәскеу.'
    segments, info = model.transcribe(f'public/audio/chapter-{chapter}.mp3', language='kk', initial_prompt=prompt, condition_on_previous_text=False, beam_size=1, word_timestamps=True, vad_filter=True)
    output=[]
    for s in segments:
        item={'start':s.start,'end':s.end,'text':s.text,'words':[{'start':w.start,'end':w.end,'word':w.word} for w in s.words]}
        output.append(item)
        target.write_text(json.dumps({'duration':info.duration,'complete':False,'segments':output},ensure_ascii=False,indent=2), encoding='utf-8')
        print(chapter, round(s.start,2), s.text, flush=True)
    target.write_text(json.dumps({'duration':info.duration,'complete':True,'segments':output},ensure_ascii=False,indent=2), encoding='utf-8')
