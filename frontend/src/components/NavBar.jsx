export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      
      {/* 1. Logo (Esquerda) */}
      <div className="text-xl font-bold text-[#1a6b6b] cursor-pointer">
        ATESTE+
      </div>

      {/* 2. Links de Navegação (Centro) */}
      <div className="flex items-center gap-8 text-sm text-gray-600 font-medium">
        <a href="/inicio" className="text-gray-900 hover:text-[#1a6b6b] transition-colors">
          Início
        </a>
        <a href="/enviar" className="hover:text-[#1a6b6b] transition-colors">
          Enviar Atestado
        </a>
        <a href="/meus-atestados" className="hover:text-[#1a6b6b] transition-colors">
          Meus Atestados
        </a>
      </div>

      {/* 3. Ícone de Perfil (Direita) */}
      <div className="cursor-pointer">
        {/* Usando um contêiner redondo cinza com um ícone SVG dentro */}
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
          <svg 
            className="w-6 h-6 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

    </nav>
  );
}