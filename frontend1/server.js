import http from 'node:http'
import fs from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import tls from 'node:tls'
import { spawn } from 'node:child_process'

async function loadLocalEnv() {
  try {
    const envFile = await fs.readFile('.env', 'utf8')

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=').replace(/^['"]|['"]$/g, '')

      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

await loadLocalEnv()

const PORT = Number.parseInt(process.env.VISION_SERVER_PORT || process.env.PORT || '3000', 10)
const HOST = process.env.VISION_SERVER_HOST || '127.0.0.1'
const DETECTOR_OFFLINE_AFTER_MS = 6000
const CONTACT_TO = process.env.CONTACT_TO || 'aura@ittterni.org'
const CONTACT_REQUESTS_DIR = path.resolve('contact-requests')

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

function encodeHeader(value) {
  return `=?UTF-8?B?${Buffer.from(String(value), 'utf8').toString('base64')}?=`
}

function sanitizeHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim()
}

function escapeSmtpData(value) {
  return String(value).replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..')
}

function smtpReadResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = ''

    const cleanup = () => {
      socket.off('data', onData)
      socket.off('error', onError)
    }

    const onError = error => {
      cleanup()
      reject(error)
    }

    const onData = chunk => {
      buffer += chunk.toString('utf8')
      const lines = buffer.split(/\r?\n/).filter(Boolean)
      const lastLine = lines.at(-1)

      if (lastLine && /^\d{3} /.test(lastLine)) {
        cleanup()
        resolve({ code: Number.parseInt(lastLine.slice(0, 3), 10), message: buffer })
      }
    }

    socket.on('data', onData)
    socket.on('error', onError)
  })
}

async function smtpCommand(socket, command, expectedCodes) {
  socket.write(`${command}\r\n`)
  const response = await smtpReadResponse(socket)

  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP command failed (${command}): ${response.message.trim()}`)
  }

  return response
}

async function sendEmail({ to, subject, text, replyTo }) {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465
  const from = process.env.SMTP_FROM || user || CONTACT_TO

  if (!host) {
    return sendEmailWithSendmail({ to, subject, text, replyTo, from })
  }

  let socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port })

  await new Promise((resolve, reject) => {
    socket.once(secure ? 'secureConnect' : 'connect', resolve)
    socket.once('error', reject)
  })

  const greeting = await smtpReadResponse(socket)
  if (greeting.code !== 220) throw new Error(`SMTP greeting failed: ${greeting.message.trim()}`)

  await smtpCommand(socket, `EHLO ${process.env.SMTP_HELO || 'aura.local'}`, [250])

  if (!secure && process.env.SMTP_STARTTLS !== 'false') {
    await smtpCommand(socket, 'STARTTLS', [220])
    socket = tls.connect({ socket, servername: host })
    await new Promise((resolve, reject) => {
      socket.once('secureConnect', resolve)
      socket.once('error', reject)
    })
    await smtpCommand(socket, `EHLO ${process.env.SMTP_HELO || 'aura.local'}`, [250])
  }

  if (user && pass) {
    const token = Buffer.from(`\u0000${user}\u0000${pass}`, 'utf8').toString('base64')
    await smtpCommand(socket, `AUTH PLAIN ${token}`, [235])
  }

  const headers = [
    `From: ${sanitizeHeader(process.env.SMTP_FROM_NAME || 'AURA')} <${sanitizeHeader(from)}>`,
    `To: <${sanitizeHeader(to)}>`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ]

  if (replyTo) {
    headers.push(`Reply-To: <${sanitizeHeader(replyTo)}>`)
  }

  const message = `${headers.join('\r\n')}\r\n\r\n${escapeSmtpData(text)}`

  await smtpCommand(socket, `MAIL FROM:<${sanitizeHeader(from)}>`, [250])
  await smtpCommand(socket, `RCPT TO:<${sanitizeHeader(to)}>`, [250, 251])
  await smtpCommand(socket, 'DATA', [354])
  socket.write(`${message}\r\n.\r\n`)
  const dataResponse = await smtpReadResponse(socket)
  if (dataResponse.code !== 250) throw new Error(`SMTP DATA failed: ${dataResponse.message.trim()}`)

  await smtpCommand(socket, 'QUIT', [221, 250]).catch(() => {})
  socket.end()

  return { sent: true }
}

function buildEmailMessage({ to, subject, text, replyTo, from }) {
  const headers = [
    `From: ${sanitizeHeader(process.env.SMTP_FROM_NAME || 'AURA')} <${sanitizeHeader(from)}>`,
    `To: <${sanitizeHeader(to)}>`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ]

  if (replyTo) {
    headers.push(`Reply-To: <${sanitizeHeader(replyTo)}>`)
  }

  return `${headers.join('\r\n')}\r\n\r\n${escapeSmtpData(text)}`
}

function sendEmailWithSendmail({ to, subject, text, replyTo, from }) {
  return new Promise((resolve) => {
    const sendmailPath = process.env.SENDMAIL_PATH || '/usr/sbin/sendmail'
    const child = spawn(sendmailPath, ['-t', '-oi'])
    let stderr = ''

    child.stderr.on('data', chunk => {
      stderr += chunk.toString('utf8')
    })

    child.on('error', error => {
      resolve({ sent: false, reason: `Sendmail non disponibile: ${error.message}` })
    })

    child.on('close', code => {
      if (code === 0) {
        resolve({ sent: true, via: 'sendmail' })
        return
      }

      resolve({
        sent: false,
        reason: `Sendmail non è riuscito a spedire il messaggio${stderr ? `: ${stderr.trim()}` : ''}`,
      })
    })

    child.stdin.end(buildEmailMessage({ to, subject, text, replyTo, from }))
  })
}

function formatValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Nessuna selezione'
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, nestedValue]) => `- ${key}: ${formatValue(nestedValue)}`)
      .join('\n')
  }
  return value || 'Non specificato'
}

function formatContactRequest(payload) {
  const submittedAt = new Date().toISOString()
  const details = Object.entries(payload.details || {})
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join('\n')

  return {
    submittedAt,
    subject: payload.type === 'scenario'
      ? `Nuova richiesta scenario AURA: ${payload.title || 'scenario'}`
      : `Nuova richiesta Start Building AURA: ${payload.title || 'agent'}`,
    text: [
      'Nuova richiesta ricevuta dal sito AURA.',
      '',
      `Tipo: ${payload.type || 'Non specificato'}`,
      `Titolo: ${payload.title || 'Non specificato'}`,
      `Pagina: ${payload.pageUrl || 'Non specificata'}`,
      `Data invio: ${submittedAt}`,
      '',
      'Specifiche richieste:',
      details || 'Nessuna specifica ricevuta',
    ].join('\n'),
  }
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

  if (req.method === 'POST' && url.pathname === '/contact/request') {
    try {
      const body = await readBody(req)
      const payload = body ? JSON.parse(body) : {}
      const email = formatContactRequest(payload)
      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      await fs.mkdir(CONTACT_REQUESTS_DIR, { recursive: true })
      await fs.writeFile(
        path.join(CONTACT_REQUESTS_DIR, `${requestId}.json`),
        JSON.stringify({ id: requestId, ...payload, submittedAt: email.submittedAt }, null, 2),
        'utf8',
      )

      const delivery = await sendEmail({
        to: CONTACT_TO,
        subject: email.subject,
        text: email.text,
        replyTo: payload.replyTo || payload.details?.email,
      })

      if (!delivery.sent) {
        sendJson(res, 503, { ok: false, error: delivery.reason, requestId })
        return
      }

      sendJson(res, 200, { ok: true, requestId })
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message })
    }
    return
  }

  sendJson(res, 404, { ok: false, error: 'Not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`AURA vision backend listening on http://${HOST}:${PORT}`)
})

setInterval(broadcastVisionState, 3000)
