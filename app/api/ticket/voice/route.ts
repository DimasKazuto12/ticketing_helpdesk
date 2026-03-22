import { NextResponse } from 'next/server';
import translate from 'google-translate-api-next';
// @ts-ignore
import gTTS from 'gtts';

export async function POST(req: Request) {
    try {
        const { text, mode, speakerId = 8 } = await req.json();

        if (mode === 'INDO') {
            try {
                const speech = new gTTS(text, 'id');

                const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
                    const chunks: any[] = [];
                    const stream = speech.stream();
                    stream.on('data', (chunk: any) => chunks.push(chunk));
                    stream.on('end', () => resolve(Buffer.concat(chunks)));
                    stream.on('error', (err: any) => reject(err));
                });

                // KONVERSI DI SINI: Buffer ke Uint8Array agar TypeScript senang
                const uint8Array = new Uint8Array(audioBuffer);

                return new NextResponse(uint8Array, {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Content-Length': uint8Array.length.toString()
                    },
                });
            } catch (err) {
                console.error("Gagal generate suara Indo:", err);
                return NextResponse.json({ error: "TTS Indo Failed" }, { status: 500 });
            }
        }

        if (mode === 'JAPAN') {
            // 1. Terjemahkan ke Jepang untuk Zundamon
            const resTranslate = await translate(text, { to: 'ja' });
            const jpText = resTranslate.text;

            // 2. Minta Audio Query ke VOICEVOX (Pastikan App VOICEVOX nyala!)
            const queryRes = await fetch(`http://localhost:50021/audio_query?text=${encodeURIComponent(jpText)}&speaker=${speakerId}`, { method: 'POST' });
            const queryData = await queryRes.json();

            // 3. Sintesis Suara
            const synthRes = await fetch(`http://localhost:50021/synthesis?speaker=${speakerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(queryData),
            });

            const audioBuffer = await synthRes.arrayBuffer();
            return new NextResponse(audioBuffer, { headers: { 'Content-Type': 'audio/wav' } });
        }

        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'VOICEVOX tidak merespon' }, { status: 500 });
    }
}