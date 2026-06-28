export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="card p-6 max-w-sm w-full shadow-xl">
        <p className="text-gray-800 dark:text-gray-100 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
          <button onClick={onConfirm} className="btn-danger">Confirmar</button>
        </div>
      </div>
    </div>
  )
}
