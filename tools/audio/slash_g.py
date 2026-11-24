"""G: original wind-blade audition, sculpted entirely from filtered noise.

The palette uses changing noise bands, micro-intakes and crossing swipes.  It
contains no pitched carrier, percussion sample, speech or background music.
"""
from __future__ import annotations

import numpy as np
from scipy import signal

NAME = "G｜スラッシュ・ウィンド"
DESCRIPTION = "空気を切る刃と小さな鞭音。音程を抑え、切れと移動感で鳴り分ける。"


def _time(duration: float, sr: int) -> np.ndarray:
    return np.arange(round(duration * sr), dtype=np.float64) / sr


def _edges(n: int, sr: int, attack: float = .001, release: float = .012) -> np.ndarray:
    env = np.ones(n, dtype=np.float64)
    a, r = max(2, round(attack * sr)), max(2, round(release * sr))
    a, r = min(a, n // 2), min(r, n // 2)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[-r:] = np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    env[0] = env[-1] = 0
    return env


def _band(duration: float, low: float, high: float, sr: int, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    x = rng.standard_normal(round(duration * sr))
    sos = signal.butter(3, [low, min(high, sr * .41)], btype="bandpass", fs=sr, output="sos")
    x = signal.sosfilt(sos, x)
    x /= max(1e-12, float(np.sqrt(np.mean(x * x))))
    return x


def _moving_air(duration: float, start: float, finish: float, sr: int, seed: int,
                breadth: float = .45, bend: float = .70) -> np.ndarray:
    """Crossfade independent broad bands along a smooth logarithmic sweep.

    A broad band and independently seeded sources prevent a resonant whistle;
    there is no oscillator or periodic comb filter hiding inside the whoosh.
    """
    t = _time(duration, sr)
    u = t / max(duration, 1 / sr)
    center = start * (finish / start) ** (u ** bend)
    out = np.zeros(len(t), dtype=np.float64)
    power = np.zeros(len(t), dtype=np.float64)
    for i, hz in enumerate((480., 750., 1150., 1750., 2700., 4150., 5800.)):
        x = _band(duration, hz / 1.55, hz * 1.50, sr, seed + i * 37)
        w = np.exp(-.5 * (np.log(hz / center) / breadth) ** 2)
        out += w * x
        power += w * w
    return out / np.sqrt(np.maximum(power, 1e-12))


def _stereo(x: np.ndarray, sr: int, pan_start: float = -.2,
            pan_end: float = .2, width: float = .035) -> np.ndarray:
    u = np.linspace(0, 1, len(x))
    p = pan_start + (pan_end - pan_start) * (u * u * (3 - 2 * u))
    # A strong, shared direct signal with subtle level movement.  Only a small
    # delayed reflection changes the side image, so mono retains the cut.
    out = np.column_stack((x * (1 - p * .30), x * (1 + p * .30)))
    d = round(.0073 * sr)
    if d < len(x):
        out[d:, 0] += x[:-d] * width
        out[d:, 1] += x[:-d] * width * .37
    return out


def _swipe(duration: float, start: float, finish: float, sr: int, seed: int,
           reverse: bool = False, pan: float = .26, soft: bool = False) -> np.ndarray:
    t = _time(duration, sr)
    u = t / duration
    air = _moving_air(duration, start, finish, sr, seed)
    if reverse:
        env = (u ** 1.8) * np.sin(np.pi * u) ** .55
    else:
        attack = .010 if soft else .003
        env = (1 - np.exp(-t / attack)) * np.exp(-u * (2.1 if soft else 3.7))
        env *= (1 - u) ** .75
    air *= env * _edges(len(t), sr, .0008, .014)
    return _stereo(air, sr, -pan, pan)


def _edge_snap(duration: float, sr: int, seed: int, low: float = 1800,
               high: float = 5400) -> np.ndarray:
    t = _time(duration, sr)
    x = _band(duration, low, high, sr, seed)
    # A slit release, not a low physical impact.  It fades before the air trail.
    x *= (1 - np.exp(-t / .0008)) * np.exp(-t / .0033)
    x *= _edges(len(t), sr, .0005, .005)
    return np.column_stack((x, x))


def _place(dst: np.ndarray, src: np.ndarray, at: float, sr: int, gain: float = 1.) -> None:
    i = round(at * sr)
    n = min(len(src), len(dst) - i)
    if n > 0:
        dst[i:i + n] += src[:n] * gain


def _finish(x: np.ndarray, sr: int, peak: float) -> np.ndarray:
    x = signal.sosfilt(signal.butter(3, 390, btype="highpass", fs=sr, output="sos"), x, axis=0)
    x = signal.sosfilt(signal.butter(4, min(6800, sr * .40), btype="lowpass", fs=sr, output="sos"), x, axis=0)
    window = _edges(len(x), sr, .0008, .018)
    x *= window[:, None]
    x -= window[:, None] * x.sum(axis=0) / window.sum()
    x *= peak / max(1e-12, float(np.max(np.abs(x))))
    x[0] = x[-1] = 0
    return np.asarray(x, dtype=np.float64)


def build(sr: int = 48000) -> dict[str, np.ndarray]:
    if sr < 24000:
        raise ValueError("Use a sample rate of at least 24000 Hz")
    out = {}

    shoot = np.zeros((round(.158 * sr), 2), dtype=np.float64)
    _place(shoot, _swipe(.018, 900, 2300, sr, 100, reverse=True, pan=.12), 0, sr, .11)
    _place(shoot, _swipe(.144, 3300, 760, sr, 120, pan=.32), .013, sr, .62)
    _place(shoot, _edge_snap(.023, sr, 140), .013, sr, .24)
    out['shoot'] = _finish(shoot, sr, .40)

    hit = np.zeros((round(.083 * sr), 2), dtype=np.float64)
    _place(hit, _edge_snap(.022, sr, 201, low=2300, high=5800), 0, sr, .43)
    _place(hit, _swipe(.080, 2350, 1250, sr, 220, pan=.08), .001, sr, .27)
    out['hit'] = _finish(hit, sr, .23)

    kill = np.zeros((round(.325 * sr), 2), dtype=np.float64)
    _place(kill, _edge_snap(.026, sr, 301, low=1500, high=4900), 0, sr, .27)
    _place(kill, _swipe(.27, 2700, 540, sr, 320, pan=-.34), 0, sr, .54)
    _place(kill, _swipe(.20, 3700, 1130, sr, 340, pan=.42), .044, sr, .22)
    _place(kill, _swipe(.21, 1600, 750, sr, 360, pan=-.18, soft=True), .096, sr, .15)
    out['kill'] = _finish(kill, sr, .45)

    # Two breathy flicks give collection a recognizable shape without a bell.
    gem = np.zeros((round(.182 * sr), 2), dtype=np.float64)
    _place(gem, _swipe(.112, 1300, 3700, sr, 410, pan=.12, soft=True), 0, sr, .39)
    _place(gem, _swipe(.113, 2300, 4200, sr, 440, pan=-.12, soft=True), .053, sr, .25)
    out['gem'] = _finish(gem, sr, .18)

    # Audible onset first; crossing slashes accelerate into a long wind release.
    signature = np.zeros((round(2.45 * sr), 2), dtype=np.float64)
    _place(signature, _edge_snap(.027, sr, 501, low=1600, high=5900), 0, sr, .23)
    _place(signature, _swipe(.21, 3300, 800, sr, 520, pan=-.44), 0, sr, .38)
    for i, (at, dur, start, end, gain) in enumerate((
        (.20, .30, 1100, 3700, .27),
        (.41, .26, 4200, 900, .34),
        (.60, .24, 1300, 4100, .37),
        (.77, .25, 3800, 850, .43),
        (.94, .27, 1700, 4400, .46),
    )):
        pan = .48 if i % 2 else -.48
        _place(signature, _swipe(dur, start, end, sr, 550 + i * 113, pan=pan), at, sr, gain)
        _place(signature, _edge_snap(.023, sr, 580 + i * 113), at + .004, sr, gain * .17)
    _place(signature, _swipe(.15, 700, 2800, sr, 1201, reverse=True, pan=.13), .99, sr, .26)
    _place(signature, _swipe(1.19, 3000, 570, sr, 1301, pan=-.22, soft=True), 1.12, sr, .57)
    _place(signature, _swipe(.83, 1900, 950, sr, 1401, pan=.26, soft=True), 1.22, sr, .22)
    _place(signature, _edge_snap(.025, sr, 1501, low=1300, high=5400), 1.12, sr, .25)
    out['signature'] = _finish(signature, sr, .65)
    return out


if __name__ == '__main__':
    import json
    result = {}
    for name, x in build().items():
        assert x.dtype == np.float64 and x.ndim == 2 and x.shape[1] == 2
        assert np.isfinite(x).all() and np.max(np.abs(x)) < 1
        assert not np.any(x[0]) and not np.any(x[-1])
        energy = float(np.mean(x * x))
        mono_energy = float(np.mean(np.mean(x, axis=1) ** 2))
        f, p = signal.welch(x.mean(axis=1), 48000, nperseg=min(len(x), 2048))
        result[name] = dict(duration=len(x) / 48000, peak=float(np.max(np.abs(x))),
                            rms=float(np.sqrt(energy)), dc=x.mean(axis=0).tolist(),
                            mono_retention=mono_energy/energy,
                            energy_above_8khz=float(p[f >= 8000].sum()/p.sum()))
    print(json.dumps(result, indent=2))
