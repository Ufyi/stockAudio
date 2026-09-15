import React, { useEffect, useRef, useState } from 'react'
import { fetchQuoteWithRetry } from './api'

function speak(text) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) return reject(new Error('No SpeechSynthesis'))
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ja-JP'
    utter.onend = () => resolve()
    utter.onerror = (e) => reject(e)
    window.speechSynthesis.speak(utter)
  })
}

export default function App() {
  const [running, setRunning] = useState(false)
  const [intervalSec, setIntervalSec] = useState(60)
  const [status, setStatus] = useState('stopped')
  const [price, setPrice] = useState(null)
  const [changePct, setChangePct] = useState(null)
  const timerRef = useRef(null)
  const speakingRef = useRef(false)
  const audioRef = useRef({ ctx: null, src: null })
  const [audioEnabled, setAudioEnabled] = useState(false)

  useEffect(() => {
    return () => stop()
  }, [])

  const formatText = (p, cp) => {
    const sign = cp >= 0 ? 'プラス' : 'マイナス'
    const absPct = Math.abs(cp).toFixed(2)
    return `日経先物、${p}円。${sign}${absPct}パーセント。`
  }

  const singleCycle = async () => {
    if (speakingRef.current) return
    try {
      setStatus('fetching')
      const q = await fetchQuoteWithRetry(3, 800)
      if (!q) { setStatus('error'); return }
      setPrice(q.currentPrice)
      setChangePct(q.changePercent)
      const text = formatText(q.currentPrice, q.changePercent)
      speakingRef.current = true
      setStatus('speaking')
      // shorten utterance duration by setting faster rate
      await (async () => {
        // create wrapper that sets rate and handles end
        return new Promise((resolve, reject) => {
          if (!('speechSynthesis' in window)) return reject(new Error('No SpeechSynthesis'))
          const utter = new SpeechSynthesisUtterance(text)
          utter.lang = 'ja-JP'
          utter.rate = 1.05
          utter.onend = () => resolve()
          utter.onerror = (e) => reject(e)
          window.speechSynthesis.speak(utter)
        })
      })()
      speakingRef.current = false
      setStatus('idle')
    } catch (e) {
      speakingRef.current = false
      setStatus('error')
    }
  }

  const start = () => {
    if (running) return
    setRunning(true)
    singleCycle()
    timerRef.current = setInterval(singleCycle, intervalSec * 1000)
  }

  const enableSilentAudio = async () => {
    if (audioEnabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      // create 1-second silent buffer and loop it
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      src.connect(ctx.destination)
      src.start(0)
      audioRef.current = { ctx, src }
      setAudioEnabled(true)
    } catch (e) {
      // ignore
    }
  }

  const stop = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setRunning(false)
    setStatus('stopped')
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    speakingRef.current = false
  }

  return (
    <div className="app">
      <h1>日経先物 読み上げ (Web)</h1>
      <p>状態: <strong>{status}</strong></p>
      <p>現在値: <strong>{price ?? '-'}</strong> 円</p>
      <p>前日比: <strong style={{ color: changePct >= 0 ? 'crimson' : 'royalblue' }}>{changePct != null ? `${changePct.toFixed(2)}%` : '-'}</strong></p>

      <div className="controls">
        <button onClick={() => setIntervalSec(30)}>30秒</button>
        <button onClick={() => setIntervalSec(60)}>1分</button>
        <button onClick={() => setIntervalSec(300)}>5分</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={enableSilentAudio} disabled={audioEnabled}>{audioEnabled ? 'バックグラウンド維持: 有効' : 'バックグラウンド維持用オーディオを有効化'}</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {!running ? (
          <button onClick={start}>開始（{intervalSec}s）</button>
        ) : (
          <button onClick={stop}>停止</button>
        )}
      </div>

      <p className="note">※ iPhone Safari のバックグラウンド制約あり（下記README参照）</p>
    </div>
  )
}
