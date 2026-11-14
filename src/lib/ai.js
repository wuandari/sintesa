// Penjelasan komponen 3D lewat Anthropic API (kunci hanya di server). Gagal/tanpa kunci → null.
export async function askPartInfo({ missionTitle, part, context, lang = 'id' }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model,
        max_tokens: 300,
        system: lang === 'en'
          ? 'You are a study assistant for grade 10 vocational high school students majoring in software engineering (RPL). Explain the component asked about in simple English, at most 80 words: its name, its function, how it relates to the mission topic, and one interesting fact. Answer ONLY about that component and the mission topic; politely decline anything else. Do not use markdown.'
          : 'Kamu asisten belajar untuk siswa SMK kelas 10 jurusan RPL. Jelaskan komponen yang ditanyakan dalam Bahasa Indonesia sederhana, maksimal 80 kata: nama komponen, fungsinya, kaitannya dengan materi misi, dan satu fakta menarik. Jawab HANYA tentang komponen dan materi misi itu; tolak topik lain dengan sopan. Jangan memakai markdown.',
        messages: [{ role: 'user', content: lang === 'en' ? `Mission: ${missionTitle}\nContext: ${context}\nComponent tapped by the student: ${part}` : `Misi: ${missionTitle}\nMateri: ${context}\nKomponen yang diketuk siswa: ${part}` }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.find((b) => b.type === 'text')?.text?.trim();
    return text ? text.slice(0, 700) : null;
  } catch {
    return null;
  }
}
