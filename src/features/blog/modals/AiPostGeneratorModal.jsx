import React, { useState } from 'react'
import {
  IconX,
  IconSparkles,
  IconSearch,
  IconCheck,
  IconClock,
  IconExternalLink,
} from '@tabler/icons-react'
import { generateAiPost } from '../api/blogApi'
import { MarkdownViewer } from '../../../components/MarkdownViewer'
import { showAlert } from '../../../helpers/toolsHelper'

export const AiPostGeneratorModal = ({ isOpen, onClose, onApplyDraft }) => {
  const [prompt, setPrompt] = useState('')
  const [useSearch, setUseSearch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    if (!prompt || prompt.trim().length < 3) {
      showAlert('Peringatan', 'Silakan masukkan topik tulisan minimal 3 karakter.', 'warning')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await generateAiPost(prompt.trim(), useSearch)
      if (res && res.data) {
        setResult(res.data)
      } else {
        showAlert('Gagal', 'Respons dari AI tidak valid.', 'error')
      }
    } catch (err) {
      showAlert('Gagal', err.message || 'Terjadi kesalahan saat memanggil asisten AI.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (onApplyDraft) {
      onApplyDraft(result)
    }
    if (onClose) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4"
      data-testid="ai-post-generator-modal"
    >
      <div className="w-full max-w-[96vw] max-h-[96vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Distinct Colored Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-purple-700 text-white shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-800/80 text-amber-300">
              <IconSparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Blog Generator</h2>
              <p className="text-xs text-purple-100">
                Buat draf artikel komprehensif terintegrasi dengan Live Search Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-100 hover:text-white hover:bg-purple-600 transition cursor-pointer"
            aria-label="Tutup"
          >
            <IconX size={22} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt & Config */}
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-xl border border-purple-200 dark:border-purple-900/40 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Topik atau Ide Artikel
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Contoh: Manfaat Mempelajari Pemrograman Golang untuk Mahasiswa Teknik"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  <IconSparkles size={18} />
                  {loading ? 'Menghasilkan...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Toggle Search Engine */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="use_search_engine_toggle"
                checked={useSearch}
                onChange={(e) => setUseSearch(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded-sm focus:ring-purple-500 border-slate-300 dark:border-slate-700"
              />
              <label
                htmlFor="use_search_engine_toggle"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <IconSearch size={16} className="text-purple-600 dark:text-purple-400" />
                Gunakan Live Search Engine untuk mencari fakta dan referensi terkini
              </label>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 space-y-3">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Asisten AI sedang menyusun draf dan meneliti referensi...
              </p>
            </div>
          )}

          {/* Result Section */}
          {result && !loading && (
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    Kategori: {result.category || 'Umum'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <IconClock size={14} />
                    Estimasi {result.reading_time || 1} menit baca
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {result.title}
                </h3>
                {result.tags && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tags: {result.tags}
                  </p>
                )}
              </div>

              {/* Citations */}
              {Array.isArray(result.citations) && result.citations.length > 0 && (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">
                    Referensi & Sitasi Mesin Pencari:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {result.citations.map((cite, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <IconExternalLink size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <span>{typeof cite === 'string' ? cite : cite.title || cite.url}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Markdown Preview */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pratinjau Draf Artikel:
                </h4>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                  <MarkdownViewer content={result.content} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Distinct Colored Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Draf yang dihasilkan AI dapat diedit kembali sebelum dipublikasikan.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!result || loading}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <IconCheck size={18} />
              Gunakan Draf Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiPostGeneratorModal
