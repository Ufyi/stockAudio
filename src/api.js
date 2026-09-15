import axios from 'axios'

const DEFAULT_YAHOO = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=NK=F'

function getProxyUrl() {
  // Vite exposes env vars via import.meta.env
  const p = import.meta?.env?.VITE_PROXY_URL
  if (p && p.length) return p
  return '/api/quote'
}

async function fetchOnce() {
  // First try configured proxy (local or deployed)
  try {
    const proxyUrl = getProxyUrl()
    const res = await axios.get(proxyUrl, { timeout: 6000 })
    if (res?.data) return res.data
  } catch (e) {
    // ignore and try direct
  }

  try {
    const res = await axios.get(DEFAULT_YAHOO, { timeout: 7000 })
    const r = res.data?.quoteResponse?.result?.[0]
    if (!r) return null
    const currentPrice = Math.round(r.regularMarketPrice)
    const changePercent = r.regularMarketChangePercent
    return { currentPrice, changePercent }
  } catch (e) {
    return null
  }
}

export async function fetchQuoteWithRetry(attempts = 3, initialDelay = 800) {
  let delay = initialDelay
  for (let i = 0; i < attempts; i++) {
    const r = await fetchOnce()
    if (r) return r
    await new Promise((res) => setTimeout(res, delay))
    delay *= 2
  }
  return null
}

export { fetchOnce as fetchQuote }
import axios from 'axios';

// 簡易: Yahoo Finance の非公式クエリを使用して先物データを取得します。
// 注意: プロダクションでは安定した有料APIや自前プロキシを推奨します。
export async function fetchQuote() {
  try {
    const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=NK=F';
    const res = await axios.get(url, { timeout: 5000 });
    const r = res.data?.quoteResponse?.result?.[0];
    if (!r) return null;
    const currentPrice = Math.round(r.regularMarketPrice);
    const changePercent = r.regularMarketChangePercent;
    return { currentPrice, changePercent };
  } catch (e) {
    return null;
  }
}
