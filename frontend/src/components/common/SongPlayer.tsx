import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import Sound from 'react-native-sound';
import { Music, Pause, Play } from 'lucide-react-native';
import { useTheme } from '../../theme';

Sound.setCategory('Playback');

interface Props {
  songUrl: string;
  autoPlay?: boolean;
}

type Status = 'loading' | 'playing' | 'paused' | 'error';

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

function urlFallbackTitle(url: string): string {
  try {
    const filename = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
    const name = filename.replace(/\.[^.]+$/, '');
    return name.replace(/[_\-]+/g, ' ').trim() || 'Profile Song';
  } catch {
    return 'Profile Song';
  }
}

function parseTextFrame(v: Uint8Array, pos: number, size: number): string {
  if (size < 2) return '';
  const enc = v[pos];
  const raw = v.slice(pos + 1, pos + size);
  let end = raw.length;
  while (end > 0 && raw[end - 1] === 0) end--;
  if (enc === 0) {
    return Array.from(raw.slice(0, end)).map(b => String.fromCharCode(b)).join('').trim();
  }
  if (enc === 1 || enc === 2) {
    const isLE = raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe;
    const start = raw.length >= 2 && ((raw[0] === 0xff && raw[1] === 0xfe) || (raw[0] === 0xfe && raw[1] === 0xff)) ? 2 : 0;
    let str = '';
    for (let i = start; i + 1 < end; i += 2) {
      const code = isLE ? raw[i] | (raw[i + 1] << 8) : (raw[i] << 8) | raw[i + 1];
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str.trim();
  }
  // UTF-8: decode manually (TextDecoder not guaranteed in all RN TS configs)
  return Array.from(raw.slice(0, end)).map(b => String.fromCharCode(b)).join('').trim();
}

function readNullTermString(v: Uint8Array, start: number, maxLen: number): string {
  let end = start;
  while (end < start + maxLen && v[end] !== 0) end++;
  return Array.from(v.slice(start, end)).map(b => String.fromCharCode(b)).join('').trim();
}

async function fetchId3Title(url: string): Promise<string | null> {
  // --- Try ID3v2 from the first 32KB ---
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-32767' } });
    const buf = await res.arrayBuffer();
    const v = new Uint8Array(buf);

    if (v[0] === 0x49 && v[1] === 0x44 && v[2] === 0x33) { // "ID3"
      const ver = v[3];
      const tagSize = ((v[6] & 0x7f) << 21) | ((v[7] & 0x7f) << 14) | ((v[8] & 0x7f) << 7) | (v[9] & 0x7f);
      const limit = Math.min(tagSize + 10, v.length);
      let pos = 10;

      while (pos < limit) {
        if (ver === 2) {
          if (pos + 6 > limit) break;
          const fid = String.fromCharCode(v[pos], v[pos + 1], v[pos + 2]);
          const sz = (v[pos + 3] << 16) | (v[pos + 4] << 8) | v[pos + 5];
          pos += 6;
          if (sz <= 0 || sz > limit) break;
          if (fid === 'TT2') { const t = parseTextFrame(v, pos, sz); if (t) return t; }
          pos += sz;
        } else {
          if (pos + 10 > limit) break;
          const fid = String.fromCharCode(v[pos], v[pos + 1], v[pos + 2], v[pos + 3]);
          const sz = ver === 4
            ? ((v[pos + 4] & 0x7f) << 21) | ((v[pos + 5] & 0x7f) << 14) | ((v[pos + 6] & 0x7f) << 7) | (v[pos + 7] & 0x7f)
            : (v[pos + 4] << 24) | (v[pos + 5] << 16) | (v[pos + 6] << 8) | v[pos + 7];
          pos += 10;
          if (sz <= 0 || sz > limit) break;
          if (fid === 'TIT2') { const t = parseTextFrame(v, pos, sz); if (t) return t; }
          pos += sz;
        }
      }
    }

    // --- Try ID3v1 from the last 128 bytes (in the same buffer if it fits) ---
    if (v.length >= 128) {
      const tail = v.slice(v.length - 128);
      if (tail[0] === 0x54 && tail[1] === 0x41 && tail[2] === 0x47) { // "TAG"
        const title = readNullTermString(tail, 3, 30);
        if (title) return title;
      }
    }
  } catch { /* silent */ }

  // --- Fetch last 128 bytes explicitly for ID3v1 ---
  try {
    const res2 = await fetch(url, { headers: { Range: 'bytes=-128' } });
    const buf2 = await res2.arrayBuffer();
    const tail = new Uint8Array(buf2);
    if (tail.length >= 128 && tail[0] === 0x54 && tail[1] === 0x41 && tail[2] === 0x47) {
      const title = readNullTermString(tail, 3, 30);
      if (title) return title;
    }
  } catch { /* silent */ }

  return null;
}

const SongPlayer: React.FC<Props> = ({ songUrl, autoPlay = true }) => {
  const { colors, spacing, radii, fontSizes, fontWeights } = useTheme();
  const soundRef = useRef<Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPlayRef = useRef(autoPlay);
  // Stores the loop-aware play fn so handlePlayPause can resume with looping intact
  const playLoopRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState<Status>('loading');
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState(urlFallbackTitle(songUrl));

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      soundRef.current?.getCurrentTime((secs) => {
        const dur = soundRef.current?.getDuration() ?? 0;
        setElapsed(secs);
        setProgress(dur > 0 ? secs / dur : 0);
      });
    }, 500);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => {
    let alive = true;
    fetchId3Title(songUrl)
      .then(t => { if (alive && t) setTitle(t); })
      .catch(() => {});
    return () => { alive = false; };
  }, [songUrl]);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setElapsed(0);
    setProgress(0);

    const sound = new Sound(songUrl, '', (err) => {
      if (!alive) { sound.release(); return; }
      if (err) { setStatus('error'); return; }
      soundRef.current = sound;
      sound.setVolume(1.0);
      const dur = sound.getDuration();
      setDuration(dur > 0 ? dur : 0);

      // Manual loop: when the track ends, seek to 0 and replay.
      // Avoids native setLooping which stacks instances on some Android versions.
      const loopPlay = (snd: Sound) => {
        snd.play(() => {
          if (!alive || soundRef.current !== snd) return;
          snd.setCurrentTime(0);
          loopPlay(snd);
        });
      };

      // Expose loop-play so handlePlayPause can also resume with looping
      playLoopRef.current = () => {
        if (soundRef.current) loopPlay(soundRef.current);
      };

      if (autoPlayRef.current) {
        loopPlay(sound);
        startTimer();
        setStatus('playing');
      } else {
        setStatus('paused');
      }
    });

    return () => {
      alive = false;
      stopTimer();
      sound.stop();
      sound.release();
      soundRef.current = null;
    };
  }, [songUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayPause = () => {
    const snd = soundRef.current;
    if (!snd) return;
    if (status === 'playing') {
      snd.pause();
      stopTimer();
      setStatus('paused');
    } else {
      playLoopRef.current();
      startTimer();
      setStatus('playing');
    }
  };

  return (
    <View style={{
      paddingHorizontal: spacing['4'],
      paddingVertical: spacing['3'],
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['2'] }}>
        {status === 'loading' && (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: spacing['3'] }} />
        )}
        {status === 'error' && (
          <Music size={18} color={colors.textDisabled} style={{ marginRight: spacing['3'] }} />
        )}
        {(status === 'playing' || status === 'paused') && (
          <TouchableOpacity
            onPress={handlePlayPause}
            style={{ marginRight: spacing['3'] }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {status === 'playing'
              ? <Pause size={20} color={colors.primary} fill={colors.primary} />
              : <Play size={20} color={colors.primary} fill={colors.primary} />
            }
          </TouchableOpacity>
        )}
        <Text
          style={{ flex: 1, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary }}
          numberOfLines={1}
        >
          {status === 'error' ? 'Could not load song' : title}
        </Text>
        {(status === 'playing' || status === 'paused') && duration > 0 && (
          <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginLeft: spacing['2'] }}>
            {formatTime(elapsed)} / {formatTime(duration)}
          </Text>
        )}
      </View>

      {status !== 'error' && (
        <View style={{ height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
          <View style={{
            width: `${Math.min(progress * 100, 100)}%`,
            height: '100%',
            backgroundColor: colors.primary,
            borderRadius: 2,
          }} />
        </View>
      )}
    </View>
  );
};

export default SongPlayer;
