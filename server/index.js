const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/api/quote', async (req, res) => {
  try {
    const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=NK=F'
    const r = await axios.get(url, { timeout: 7000 })
    const d = r.data?.quoteResponse?.result?.[0]
    if (!d) return res.status(500).json({ error: 'no_data' })
    const currentPrice = Math.round(d.regularMarketPrice)
    const changePercent = d.regularMarketChangePercent
    res.json({ currentPrice, changePercent })
  } catch (e) {
    res.status(500).json({ error: 'fetch_failed' })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Proxy server listening on ${port}`))
