export function Navbar() {
  return (
    <nav className="bg-hala-blue-darker border-b border-hala-blue-darker shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/">
            <h1 className="text-2xl font-bold hover:text-hala-orange transition-colors duration-200 text-white">Hala</h1>
            </a>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="/races" 
              className="text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium"
            >
              Races
            </a>
            <span className="text-gray-500">|</span>
            <a 
              href="#lists" 
              className="text-lg text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium"
            >
              Lists
            </a>
            <span className="text-gray-500">|</span>
            <a 
              href="#diary" 
              className="text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium"
            >
              Diary
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-hala-orange hover:bg-hala-orange-dark text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
              Sign in 
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white transition-colors duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 