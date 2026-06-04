// Header institucional reutilizable — aparece en todos los pasos excepto Welcome
export default function HeaderUIS() {
  return (
    <header className="w-full px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: '#e8f4d8', background: 'white' }}>
      {/* Logo MEN */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-body text-gray-400 text-xs leading-none">Ministerio de</span>
          <span className="font-display font-bold text-gray-700 text-xs leading-tight">Educación Nacional</span>
          <div className="flex gap-0.5 mt-0.5">
            <div className="h-0.5 w-5 rounded-full bg-yellow-400" />
            <div className="h-0.5 w-3 rounded-full bg-blue-700" />
            <div className="h-0.5 w-3 rounded-full bg-red-600" />
          </div>
        </div>
      </div>

      {/* Lema central */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-xs font-body" style={{ color: '#67B93E' }}>✓</span>
        <span className="font-body text-gray-500 text-xs">Con Dignidad,</span>
        <span className="font-display font-bold text-xs" style={{ color: '#67B93E' }}>¡CUMPLIMOS!</span>
      </div>

      {/* Logo UIS */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs text-white" style={{ background: '#67B93E' }}>
          UIS
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-display font-bold text-gray-700 text-xs leading-tight">Universidad</span>
          <span className="font-display font-bold text-gray-700 text-xs leading-tight">Industrial de Santander</span>
        </div>
      </div>
    </header>
  )
}
