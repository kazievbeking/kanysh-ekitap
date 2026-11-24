import sys
from pathlib import Path
sys.path.insert(0,str(Path('.tools/pydeps').resolve()))
import av
from PIL import Image
picture=Image.open('materials/illustrations/protect-auezov.png').convert('RGB')
picture.resize((640,360),Image.Resampling.LANCZOS).save('public/video/protect/clip-5.jpg',quality=90)
out=av.open('public/video/protect/clip-5.mp4','w',options={'movflags':'+faststart'})
stream=out.add_stream('libx264',rate=24);stream.width=640;stream.height=360;stream.pix_fmt='yuv420p';stream.options={'crf':'22','preset':'fast'}
count=85*24
for i in range(count):
 scale=1+.04*i/(count-1);w=picture.width/scale;h=picture.height/scale
 x=(picture.width-w)*.4;y=(picture.height-h)*.45
 image=picture.crop((int(x),int(y),int(x+w),int(y+h))).resize((640,360),Image.Resampling.LANCZOS)
 frame=av.VideoFrame.from_image(image)
 for packet in stream.encode(frame):out.mux(packet)
for packet in stream.encode():out.mux(packet)
out.close()
print('Mukhtar Auezov: 85-second image-based camera movement, H.264 640x360, original portrait preserved.')
