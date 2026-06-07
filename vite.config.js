import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RESULTS_PATH = path.join(__dirname, 'src', 'data', 'userResponses.json')

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

async function readResults() {
  try {
    const raw = await fs.readFile(RESULTS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function writeResults(results) {
  await fs.mkdir(path.dirname(RESULTS_PATH), { recursive: true })
  await fs.writeFile(RESULTS_PATH, `${JSON.stringify(results, null, 2)}\n`, 'utf8')
}

function jsonResponse(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function experimentResultsPlugin() {
  return {
    name: 'experiment-results-api',
    configureServer(server) {
      server.middlewares.use('/api/results', async (req, res) => {
        try {
          if (req.method === 'GET') {
            jsonResponse(res, 200, await readResults())
            return
          }

          if (req.method === 'POST') {
            const payload = await readJsonBody(req)
            const results = await readResults()
            const saved = {
              ...payload,
              id: payload.id ?? `result-${Date.now()}`,
              savedAt: new Date().toISOString(),
            }
            results.push(saved)
            await writeResults(results)
            jsonResponse(res, 201, saved)
            return
          }

          jsonResponse(res, 405, { error: 'Method not allowed' })
        } catch (error) {
          jsonResponse(res, 500, { error: error.message })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [experimentResultsPlugin(), react(), tailwindcss()],
})
