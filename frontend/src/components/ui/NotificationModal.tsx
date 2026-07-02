'use client'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error'
  message: string
  title?: string
  btnLabel?: string
}

export default function NotificationModal({
  isOpen,
  onClose,
  type,
  message,
  title,
  btnLabel = "Compris"
}: NotificationModalProps) {
  if (!isOpen) return null

  const defaultTitle = type === 'success' ? 'Succès !' : 'Oups...'

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 transition-all transform scale-100 duration-200">
        <div className="text-center space-y-3">
          <div className="text-4xl">{type === 'success' ? '✨' : '❌'}</div>
          <h3 className="text-lg font-semibold text-gray-900 font-text">
            {title || defaultTitle}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`w-full px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors ${
              type === 'success' ? 'bg-dark-blue hover:bg-opacity-90' : 'bg-orange hover:bg-[#e89454]'
            }`}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}