export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="logo">
          <h1>Final Test Realty</h1>
        </div>
        <nav>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/properties">Properties</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}