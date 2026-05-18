import http from 'node:http'

const PORT = Number.parseInt(process.env.VISION_SERVER_PORT || process.env.PORT || '3000', 10)
const HOST = process.env.VISION_SERVER_HOST || '127.0.0.1'
const DETECTOR_OFFLINE_AFTER_MS = 6000

const clients = new Set()

let visionState = {
  lookingAtCamera: false,
  command: 'stop',
  reason: 'waiting-for-detector',
  detectorOnline: false,
  yaw: null,
  pitch: null,
  updatedAt: null,
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function detectorOnlineFor(state) {
  if (!state.updatedAt) return false
  return Date.now() - Date.parse(state.updatedAt) < DETECTOR_OFFLINE_AFTER_MS
}

function currentVisionState() {
  return {
    ...visionState,
    detectorOnline: detectorOnlineFor(visionState),
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    ...corsHeaders,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', chunk => {
      body += chunk

      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'))
        req.destroy()
      }
    })

    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function writeSse(res, payload) {
  res.write(`event: vision-status\n`)
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function broadcastVisionState() {
  const payload = currentVisionState()

  for (const client of clients) {
    writeSse(client, payload)
  }
}

function normalizeVisionPayload(payload) {
  const lookingAtCamera = Boolean(
    payload.lookingAtCamera ?? payload.looking_at_camera ?? payload.command === 'start',
  )

  return {
    lookingAtCamera,
    command: lookingAtCamera ? 'start' : 'stop',
    reason: String(payload.reason || (lookingAtCamera ? 'looking-at-camera' : 'not-looking')),
    detectorOnline: true,
    yaw: Number.isFinite(payload.yaw) ? payload.yaw : null,
    pitch: Number.isFinite(payload.pitch) ? payload.pitch : null,
    updatedAt: new Date().toISOString(),
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (req.method === 'GET' && url.pathname === '/vision/status') {
    sendJson(res, 200, currentVisionState())
    return
  }

  if (req.method === 'GET' && url.pathname === '/vision/events') {
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    clients.add(res)
    writeSse(res, currentVisionState())

    req.on('close', () => {
      clients.delete(res)
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/vision/status') {
    try {
      const body = await readBody(req)
      const payload = body ? JSON.parse(body) : {}
      visionState = normalizeVisionPayload(payload)
      broadcastVisionState()
      sendJson(res, 200, currentVisionState())
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message })
    }
    return
  }

  sendJson(res, 404, { ok: false, error: 'Not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`AURA vision backend listening on http://${HOST}:${PORT}`)
})

setInterval(broadcastVisionState, 3000)
